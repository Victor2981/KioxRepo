<?php
use PHPMailer\PHPMailer\PHPMailer;
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';
require 'PHPMailer/src/Exception.php';
require 'fpdf/fpdf.php';

$nombre = $_POST['nombre'];
$email = $_POST['email'];
$mensaje = $_POST['mensaje '];

$pdf = new FPDF();
$pdf->AddPage();
$pdf->SetFont('Arial', 'B', 16);
$pdf->Cell(40,10, 'Receta');
$pdf->Ln(10);
$pdf->SetFont('Arial', '', 12);
$pdf->MultiCell(0, 10, "Nombre: $nombre\nEmail: $email\nMensaje: $mensaje");

$nombreArchivo = 'formulario.pdf';
$pdf->Output('F', $nombreArchivo);

$mail = new PHPMailer(true);

try {
  $mail->isSMTP();
  $mail->Host = 'mail.kiox.mx';
  $mail->SMTPAuth = true;
  $mail->Username = 'hola@kiox.mx';
  $mail->Password = 'FoNZ(YPct9rU';
  $mail->SMTPSecure = 'ssl';
  $mail->Port = 465;

  $mail->setFrom('hola@kiox.mx', 'Formulario Web');
  $mail->addAddress('vhunava@gmail.com');

  $mail->Subject = 'Nuevo formulario recibido';
  $mail->Body    = 'Adjunto encontrarás el formulario en PDF.';

  $mail->addAttachment($nombreArchivo);

  $mail->send();
  echo 'Correo enviado con PDF adjunto.';
} catch (Exception $e) {
  echo "Error al enviar: {$mail->ErrorInfo}";
} finally {
  if (file_exists($nombreArchivo)) {
    unlink($nombreArchivo);
  }
}
?>