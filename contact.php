<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

session_start();
$rate_limit_time = 60;
$last_submit = $_SESSION['last_form_submit'] ?? 0;

if (time() - $last_submit < $rate_limit_time) {
    http_response_code(429);
    echo json_encode([
        'success' => false,
        'message' => 'Príliš mnoho pokusov. Skúste znova o chvíľu.'
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    $name = htmlspecialchars(trim($data['name'] ?? ''), ENT_QUOTES, 'UTF-8');
    $email = filter_var(trim($data['email'] ?? ''), FILTER_VALIDATE_EMAIL);
    $message = htmlspecialchars(trim($data['message'] ?? ''), ENT_QUOTES, 'UTF-8');

    if (empty($name) || empty($message)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Meno a správa sú povinné']);
        exit;
    }

    if (!$email) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Neplatný email']);
        exit;
    }

    if (strlen($name) > 100 || strlen($message) > 3000) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Text je príliš dlhý']);
        exit;
    }

    $email = str_replace(["\r", "\n", "%0a", "%0d"], '', $email);
    $name = str_replace(["\r", "\n", "%0a", "%0d"], '', $name);


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
                    <td style='background-color: #2a1f15; padding: 20px 30px; text-align: center; border-bottom: 3px solid #b98f39;'>
                        <img src='https://bellegis.sk/logo-transparent.png' alt='BELLegis logo' style='max-width: 110px; height: auto; margin-bottom: 16px; display: block; margin-left: auto; margin-right: auto;' />
                        <h1 style='margin: 0; color: #f4ead0; font-family: \"Times New Roman\", serif; font-size: 26px; font-weight: 500; letter-spacing: 0.5px;'>
                            BELLegis s. r. o.
                        </h1>
                        <p style='margin: 10px 0 0 0; color: #b98f39; font-size: 11px; letter-spacing: 3px; text-transform: uppercase;'>
                            Rastieme spolu
                        </p>
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

    $mail_to_user_sent = mail($to_user, $subject_user, $email_body_user, $headers_user);

    $_SESSION['last_form_submit'] = time();

    if ($mail_to_company_sent && $mail_to_user_sent) {
        echo json_encode(['success' => true, 'message' => 'Emaily odoslané']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Chyba pri odosielaní']);
    }

} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}

