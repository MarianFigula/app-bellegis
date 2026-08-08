<?php

// ---------------------------------------------------------------------------
// Bot protection settings
// ---------------------------------------------------------------------------

const ALLOWED_ORIGINS  = ['https://bellegis.sk', 'https://www.bellegis.sk'];
const MIN_FILL_SECONDS = 3;     // form filled in faster than this = bot
const TOKEN_TTL        = 7200;  // token lifetime (2 h)
const MAX_LINKS        = 7;     // more links than this in a message = spam

const MAX_NAME_CHARS    = 100;  // keep in sync with maxLength in Contact.tsx
const MAX_EMAIL_CHARS   = 254;
const MAX_MESSAGE_CHARS = 2000;

// Per-IP limit: the first gap is 30 s and doubles with every further attempt
// (30 s, 1, 2, 4, 8 ... min), but never past RATE_MAX_GAP. After
// RATE_RESET_AFTER without a single attempt the counter goes back to zero.
const RATE_BASE_GAP    = 30;
const RATE_MAX_GAP     = 3600;  // ceiling - 1 h
const RATE_RESET_AFTER = 7200;  // 2 h of silence = clean slate

/**
 * Secret key for signing tokens. Resolution order:
 *   1. CONTACT_TOKEN_SECRET environment variable (e.g. SetEnv in .htaccess)
 *   2. secret.php next to this script (not in git)
 *   3. generated on first run and stored in secret.php
 *
 * The file carries the .php extension, so the server executes it - it never
 * serves the contents.
 */
function token_secret(): string
{
    static $secret = null;
    if ($secret !== null) {
        return $secret;
    }

    $fromEnv = getenv('CONTACT_TOKEN_SECRET');
    if (is_string($fromEnv) && strlen($fromEnv) >= 32) {
        return $secret = $fromEnv;
    }

    // secret.php next to this script is the intended location and is checked
    // first, so a hand-written key always wins. It is safe in the web root: the
    // .php extension means the server executes the file rather than printing it.
    // The other two are fallbacks for when that file is missing, so the form
    // keeps working instead of rejecting every token. No .htaccess needed.
    $candidates = [
        __DIR__ . '/secret.php',
        dirname(__DIR__) . '/secret.php',
        sys_get_temp_dir() . '/secret.php',
    ];

    foreach ($candidates as $file) {
        if (is_file($file)) {
            $value = include $file;
            if (is_string($value) && strlen($value) >= 32) {
                return $secret = $value;
            }
        }
    }

    $generated = bin2hex(random_bytes(32));
    $content = "<?php\n// Generated automatically. Do not share and do not commit.\nreturn '$generated';\n";

    foreach ($candidates as $file) {
        if (@file_put_contents($file, $content, LOCK_EX) !== false) {
            return $secret = $generated;
        }
    }

    // Nothing is writable. A random key would change on every request and nobody
    // would ever get the form submitted, so derive a stable one from the server.
    return $secret = hash('sha256', __FILE__ . filemtime(__FILE__) . php_uname('n'));
}

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');
header('X-Content-Type-Options: nosniff');
header('Vary: Origin');

// Tokens must never be cached. A proxy or bfcache holding on to one GET response
// would hand the same token to everyone, and once it aged past TOKEN_TTL the
// client's expiry retry would re-fetch, get the very same stale token back and
// fail forever - the form would be permanently broken with no way out.
header('Cache-Control: no-store');

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '') {
    // If the browser sends an Origin it has to match. A missing Origin is not
    // blocked, so that clients are not cut off - the layers below cover that.
    if (!in_array($origin, ALLOWED_ORIGINS, true)) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Neplatný pôvod požiadavky']);
        exit;
    }
    header('Access-Control-Allow-Origin: ' . $origin);
}

/** Creates a signed token carrying a timestamp. */
function issue_token(): string
{
    $ts = time();
    return $ts . '.' . hash_hmac('sha256', (string) $ts, token_secret());
}

/** Verifies the token signature, its lifetime and the minimum fill time. */
function token_is_valid(string $token): bool
{
    $parts = explode('.', $token, 2);
    if (count($parts) !== 2) {
        return false;
    }
    [$ts, $sig] = $parts;
    if (!ctype_digit($ts)) {
        return false;
    }
    $expected = hash_hmac('sha256', $ts, token_secret());
    if (!hash_equals($expected, $sig)) {
        return false;
    }
    $age = time() - (int) $ts;

    return $age >= MIN_FILL_SECONDS && $age <= TOKEN_TTL;
}

/** IPv6 is counted per /64 - privacy extensions rotate the low 64 bits. */
function ip_bucket(string $ip): string
{
    $packed = @inet_pton($ip);
    if ($packed === false) {
        return $ip;
    }

    if (strlen($packed) === 16) {
        return bin2hex(substr($packed, 0, 8)) . '::/64';
    }

    return $ip;
}

/**
 * The address the rate limiter counts against.
 *
 * Websupport hands PHP the real client address with no proxy in between, so
 * REMOTE_ADDR is the whole story today. The forwarded-header branch only opens
 * when REMOTE_ADDR turns out to be private or loopback - i.e. the site really
 * did move behind a proxy later on. While REMOTE_ADDR stays public,
 * X-Forwarded-For is ignored outright, so a spammer cannot invent a header and
 * mint themselves a fresh bucket on every request.
 */
function client_ip(): string
{
    $remote = $_SERVER['REMOTE_ADDR'] ?? '';
    $public = FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE;

    if ($remote !== '' && filter_var($remote, FILTER_VALIDATE_IP, $public)) {
        return ip_bucket($remote);
    }

    $forwarded = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '';
    if ($forwarded !== '') {
        // Rightmost entry is the one the nearest proxy appended - the address it
        // actually saw connecting. Everything to its left came from the client
        // and can say anything at all.
        $parts     = array_map('trim', explode(',', $forwarded));
        $candidate = (string) end($parts);
        if (filter_var($candidate, FILTER_VALIDATE_IP)) {
            return ip_bucket($candidate);
        }
    }

    return $remote !== '' ? ip_bucket($remote) : '0.0.0.0';
}

/**
 * Per-IP limit with doubling backoff (file-backed storage - works without
 * cookies, unlike a $_SESSION limit, which bots simply bypass by not keeping
 * the cookie).
 *
 * After the 1st send the wait is 30 s, then 60 s, then 2 min, 4 min, 8 min ...
 * up to the RATE_MAX_GAP ceiling. Only an accepted attempt raises the counter;
 * a rejected one does nothing, so the announced wait actually holds. Otherwise
 * someone who dutifully waits would come back to an even longer wait.
 *
 * That is why reading (rate_limit_check) is split from writing
 * (rate_limit_record): the check runs early, but the strike is only counted
 * once the message has really been sent. Writing before validation would lock
 * a visitor out for 30 s over a plain typo in their email, 60 s over the next.
 *
 * @return string|null path to the record, or null if nothing is writable
 */
function rate_limit_file(string $ip): ?string
{
    $dir = sys_get_temp_dir() . '/bellegis_form_rate';
    if (!is_dir($dir) && !@mkdir($dir, 0700, true) && !is_dir($dir)) {
        return null; // storage unavailable - rather let the message through
    }

    // Occasional cleanup of stale records.
    if (random_int(1, 100) === 1) {
        foreach (glob($dir . '/*.json') ?: [] as $old) {
            if ((int) @filemtime($old) < time() - 86400) {
                @unlink($old);
            }
        }
    }

    return $dir . '/' . hash('sha256', $ip) . '.json';
}

/**
 * Reads the stored state, applying the reset after a long silence.
 *
 * @return array{last: int, strikes: int}
 */
function rate_limit_state(?string $file): array
{
    $state = $file !== null && is_file($file)
        ? (json_decode((string) @file_get_contents($file), true) ?: [])
        : [];

    $last    = (int) ($state['last'] ?? 0);
    $strikes = (int) ($state['strikes'] ?? 0);

    // Long silence = clean slate.
    if ($last > 0 && time() - $last > RATE_RESET_AFTER) {
        return ['last' => 0, 'strikes' => 0];
    }

    return ['last' => $last, 'strikes' => $strikes];
}

/** @return int 0 = fine, otherwise the number of seconds until the next try */
function rate_limit_check(?string $file): int
{
    ['last' => $last, 'strikes' => $strikes] = rate_limit_state($file);

    if ($last === 0 || $strikes === 0) {
        return 0;
    }

    $required = (int) min(RATE_BASE_GAP * (2 ** ($strikes - 1)), RATE_MAX_GAP);

    return max(0, $required - (time() - $last));
}

/** Counts an accepted attempt - called only once the mail has gone out. */
function rate_limit_record(?string $file): void
{
    if ($file === null) {
        return;
    }

    @file_put_contents(
        $file,
        json_encode([
            'last'    => time(),
            'strikes' => rate_limit_state($file)['strikes'] + 1,
        ]),
        LOCK_EX
    );
}

/** The wait, phrased so a visitor can understand it. */
function wait_message(int $seconds): string
{
    return $seconds < 60
        ? "Príliš veľa pokusov. Skúste to znova o $seconds s."
        : 'Príliš veľa pokusov. Skúste to znova o ' . (int) ceil($seconds / 60) . ' min.';
}

/**
 * Pretend it was sent - a bot never learns the trap caught it.
 *
 * The strike is recorded even though no mail went out. The response is byte for
 * byte the one a real send produces, so this leaks nothing, and it means a bot
 * that keeps tripping the traps walks into the same doubling backoff as everyone
 * else instead of retrying at full speed forever.
 */
function fake_success(?string $rate_file): void
{
    rate_limit_record($rate_file);
    echo json_encode(['success' => true, 'message' => 'Emaily odoslané']);
    exit;
}

/**
 * Reads one text field out of the decoded JSON body.
 *
 * Only the envelope is guaranteed to be an array, the values are whatever the
 * client sent. Passing a non-string (e.g. {"name":["x"]}) straight to trim()
 * is a TypeError on PHP 8, which would turn the response into a 500 with error
 * output appended after the already-sent JSON header. Anything that is not a
 * string is treated as absent.
 */
function field(array $data, string $key): string
{
    $value = $data[$key] ?? '';

    return is_string($value) ? trim($value) : '';
}

/**
 * Length in characters, matching how the browser counts maxLength.
 *
 * mbstring is present on practically every host, but a missing extension here
 * would be a fatal error that kills the whole form, so the regex fallback keeps
 * this working regardless of the host's PHP build.
 */
function text_length(string $value): int
{
    return function_exists('mb_strlen')
        ? mb_strlen($value, 'UTF-8')
        : (int) preg_match_all('/./us', $value);
}

// The form asks for a token as the page loads: GET /contact.php
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode(['token' => issue_token()]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!is_array($data)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Neplatné dáta']);
        exit;
    }

    $rate_file = rate_limit_file(client_ip());

    // 1. Honeypot - the field is invisible to a human (off-screen, out of the
    //    tab order), a bot fills it in. The name "subject" is deliberate: the
    //    browser does not autofill it, but to a bot it looks like a normal field.
    if (field($data, 'subject') !== '') {
        fake_success($rate_file);
    }

    // 2. A signed token proves the form was actually loaded, and doubles as the
    //    check that filling it in took at least MIN_FILL_SECONDS.
    if (!token_is_valid(field($data, 'token'))) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'code'    => 'token',
            'message' => 'Formulár vypršal. Obnovte stránku a skúste to znova.'
        ]);
        exit;
    }

    // 3. Per-IP limit with doubling backoff. Only the check runs here - the
    //    strike is recorded further down, once the mail has actually gone out.
    $wait = rate_limit_check($rate_file);
    if ($wait > 0) {
        http_response_code(429);
        header('Retry-After: ' . $wait);
        echo json_encode([
            'success'    => false,
            'message'    => wait_message($wait),
            'retryAfter' => $wait,
        ]);
        exit;
    }

    // Raw values first - lengths are measured on these, in characters. Escaping
    // happens only afterwards, for the HTML mails.
    $name    = field($data, 'name');
    $email   = filter_var(field($data, 'email'), FILTER_VALIDATE_EMAIL);
    $message = field($data, 'message');

    if ($name === '' || $message === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Meno a správa sú povinné']);
        exit;
    }

    // Email validation
    if (!$email) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Neplatný email']);
        exit;
    }

    // Characters, not bytes: strlen() would count a Slovak diacritic as 2 and an
    // escaped apostrophe (&#039;) as 6, so an ordinary "Ľubomír Ďurčovič" eats
    // far more of the budget than the browser's maxLength counted, and a message
    // the textarea happily accepted would be rejected here.
    if (
        text_length($name) > MAX_NAME_CHARS
        || text_length($email) > MAX_EMAIL_CHARS
        || text_length($message) > MAX_MESSAGE_CHARS
    ) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Text je príliš dlhý']);
        exit;
    }

    $name    = htmlspecialchars($name, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $message = htmlspecialchars($message, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');

    // 4. Typical spam packs links into the message. A real client sends them
    //    rarely - if it ever gets in the way, just raise MAX_LINKS.
    if (preg_match_all('~https?://|www\.~i', $name . ' ' . $message) > MAX_LINKS) {
        fake_success($rate_file);
    }

    $email = str_replace(["\r", "\n", "%0a", "%0d"], '', $email);
    $name  = str_replace(["\r", "\n", "%0a", "%0d"], '', $name);


    $to_company = 'bellegis@bellegis.sk';
    $subject_company = 'Kontakt od klienta - web bellegis.sk';

    $email_body_company = "
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
</head>
<body style='margin: 0; padding: 0; font-family: Georgia, \"Times New Roman\", serif; background-color: #f7f3ea;'>
<table style='background-color: #f7f3ea; width: 100%'>
    <tr>
        <td style='padding: 40px 20px;'>
            <table width='600' style='margin: 0 auto; background-color: #ffffff; border: 1px solid #e6dec9;'>

                <!-- Header -->
                <tr>
                    <td style='background-color: #2a1f15; padding: 24px 30px; text-align: center; border-bottom: 3px solid #b98f39;'>
                        <img src='https://bellegis.sk/logo-transparent.png' alt='BELLegis logo' style='max-width: 140px; height: auto; margin-top: 18px; display: block; margin-left: auto; margin-right: auto;' />
                    </td>
                </tr>

                <!-- Content -->
                <tr>
                    <td style='padding: 40px 30px; font-family: Arial, sans-serif;'>
                        <h2 style='margin: 0 0 25px 0; color: #2a1f15; font-family: Georgia, \"Times New Roman\", serif; font-size: 20px; font-weight: 500;'>
                            Nová správa z kontaktného formulára
                        </h2>

                        <table style='margin-bottom: 25px; width: 100%; border-collapse: collapse;'>
                            <tr>
                                <td style='padding: 12px; background-color: #faf7ee; border-bottom: 1px solid #e6dec9; width: 120px;'>
                                    <strong style='color: #4a3826;'>Meno:</strong>
                                </td>
                                <td style='padding: 12px; border-bottom: 1px solid #e6dec9; color: #2a1f15;'>
                                    $name
                                </td>
                            </tr>
                            <tr>
                                <td style='padding: 12px; background-color: #faf7ee; border-bottom: 1px solid #e6dec9;'>
                                    <strong style='color: #4a3826;'>Email:</strong>
                                </td>
                                <td style='padding: 12px; border-bottom: 1px solid #e6dec9;'>
                                    <a href='mailto:$email' style='color: #97691e; text-decoration: none;'>$email</a>
                                </td>
                            </tr>
                        </table>

                        <div style='margin-top: 25px;'>
                            <strong style='display: block; margin-bottom: 10px; color: #4a3826; font-family: Arial, sans-serif;'>Správa:</strong>
                            <div style='padding: 20px; background-color: #faf7ee; border-left: 3px solid #b98f39; color: #2a1f15; line-height: 1.6;'>
                                " . nl2br($message) . "
                            </div>
                        </div>
                    </td>
                </tr>

                <!-- Footer -->
                <tr>
                    <td style='padding: 25px 30px; background-color: #2a1f15; text-align: center;'>
                        <p style='margin: 0; color: #f4ead0; font-family: Arial, sans-serif; font-size: 13px; line-height: 1.7;'>
                            Južná trieda 48B, 040 01 Košice<br>
                            +421 907 358 317 | bellegis@bellegis.sk
                        </p>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
</body>
</html>
";

    $headers_company = "MIME-Version: 1.0\r\n";
    $headers_company .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers_company .= "From: bellegis@bellegis.sk\r\n";
    $headers_company .= "Reply-To: $email\r\n";

    $mail_to_company_sent = mail($to_company, $subject_company, $email_body_company, $headers_company);

    // The confirmation to the visitor is only sent below - after the honeypot,
    // the token, the rate limit and validation, and only if the message really
    // did reach the company. Otherwise the form could be abused to send mail to
    // arbitrary addresses, which would damage the domain's reputation
    // (Websupport filters outgoing mail too).
    if (!$mail_to_company_sent) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Chyba pri odosielaní']);
        exit;
    }

    // The attempt only counts now that it has really produced a mail. A visitor
    // whose message bounced off validation - or off a server-side mail failure -
    // is not made to wait before trying again.
    rate_limit_record($rate_file);

    $to_user = $email;
    $subject_user = 'Potvrdenie prijatia správy - BELLegis s. r. o.';

    $email_body_user = "
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
</head>
<body style='margin: 0; padding: 0; font-family: Georgia, \"Times New Roman\", serif; background-color: #f7f3ea;'>
<table style='background-color: #f7f3ea; width: 100%'>
    <tr>
        <td style='padding: 40px 20px;'>
            <table width='600' style='margin: 0 auto; background-color: #ffffff; border: 1px solid #e6dec9;'>

                <!-- Header -->
                <tr>
                    <td style='background-color: #2a1f15; padding: 24px 30px; text-align: center; border-bottom: 3px solid #b98f39;'>
                        <img src='https://bellegis.sk/logo-transparent.png' alt='BELLegis logo' style='max-width: 140px; height: auto; margin-top: 18px; display: block; margin-left: auto; margin-right: auto;' />
                    </td>
                </tr>

                <!-- Body -->
                <tr>
                    <td style='padding: 40px 36px; font-family: Arial, sans-serif; color: #2a1f15;'>
                        <h2 style='margin: 0 0 20px 0; color: #2a1f15; font-family: Georgia, \"Times New Roman\", serif; font-size: 22px; font-weight: 500;'>
                            Vážený pán / Vážená pani $name,
                        </h2>

                        <p style='font-size: 15px; line-height: 1.7; margin: 0 0 20px 0;'>
                            ďakujeme za Vašu správu. Potvrdzujeme jej prijatie a budeme Vás čo najskôr kontaktovať.
                        </p>

                        <div style='background-color: #faf7ee; padding: 20px; border-left: 3px solid #b98f39; margin: 30px 0;'>
                            <p style='margin: 0; font-weight: 600; color: #97691e; font-family: Arial, sans-serif;'>
                                Vaša správa bola úspešne doručená.
                            </p>
                        </div>

                        <h3 style='color: #2a1f15; font-family: Georgia, \"Times New Roman\", serif; font-size: 17px; font-weight: 500; margin: 30px 0 12px 0;'>
                            Kontaktné údaje
                        </h3>
                        <table style='width: 100%; font-size: 14px; line-height: 1.6;'>
                            <tr>
                                <td style='padding: 4px 0; width: 90px; color: #4a3826;'><strong>Adresa:</strong></td>
                                <td style='padding: 4px 0;'>Južná trieda 48B, 040 01 Košice</td>
                            </tr>
                            <tr>
                                <td style='padding: 4px 0; color: #4a3826;'><strong>Telefón:</strong></td>
                                <td style='padding: 4px 0;'><a href='tel:+421907358317' style='color: #97691e; text-decoration: none;'>+421 907 358 317</a></td>
                            </tr>
                            <tr>
                                <td style='padding: 4px 0; color: #4a3826;'><strong>Email:</strong></td>
                                <td style='padding: 4px 0;'><a href='mailto:bellegis@bellegis.sk' style='color: #97691e; text-decoration: none;'>bellegis@bellegis.sk</a></td>
                            </tr>
                        </table>

                        <p style='margin-top: 36px; color: #4a3826; font-family: Arial, sans-serif; font-size: 14px;'>
                            S pozdravom,<br>
                            <strong style='color: #2a1f15; font-family: \"Times New Roman\", serif; font-size: 16px;'>BELLegis s. r. o.</strong>
                        </p>
                    </td>
                </tr>

                <!-- Footer -->
                <tr>
                    <td style='padding: 22px 30px; background-color: #2a1f15; text-align: center;'>
                        <p style='margin: 0 0 6px 0; color: #f4ead0; font-family: Arial, sans-serif; font-size: 12px;'>
                            Tento email je automatická odpoveď. Prosím neodpovedajte na túto správu.
                        </p>
                        <p style='margin: 8px 0 0 0; font-family: Arial, sans-serif;'>
                            <a href='https://bellegis.sk' style='color: #b98f39; text-decoration: none; font-size: 12px;'>www.bellegis.sk</a>
                        </p>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
</body>
</html>";

    $headers_user = "MIME-Version: 1.0\r\n";
    $headers_user .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers_user .= "From: bellegis@bellegis.sk\r\n";
    $headers_user .= "Reply-To: bellegis@bellegis.sk\r\n";

    // The confirmation is a courtesy - if it fails, the message to the company
    // has already gone out, so we still report success to the visitor. Reporting
    // an error here would only make them send the whole thing again.
    mail($to_user, $subject_user, $email_body_user, $headers_user);

    echo json_encode(['success' => true, 'message' => 'Emaily odoslané']);

} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
