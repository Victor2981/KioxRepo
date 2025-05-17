<?php
use PHPMailer\PHPMailer\PHPMailer;
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';
require 'PHPMailer/src/Exception.php';
require 'fpdf/fpdf.php';

$nombre = $_POST['nombre'];
$email = $_POST['email'];
$mensaje = $_POST['mensaje'];
//public $fisioterapeuta;
//public $cedula = "12345678";

class PDF extends FPDF {
    function Header() {
        // Logo a la izquierda
        $this->Image('../img/logoKiox.png', 10, 10, 30); // x, y, width

        // Fuente para encabezado
        $this->SetFont('Arial', '', 12);

        // Fecha a la derecha
        $this->SetXY(-60, 10); // Posición desde la derecha
        $this->Cell(50, 10, date('d/m/Y'), 0, 0, 'R');

        // Datos centrados
        $this->SetXY(0, 15);
        $this->SetFont('Arial', 'B', 12);
        //$this->Cell(0, 10, utf8_decode($this->fisioterapeuta), 0, 1, 'C');
        $this->SetFont('Arial', '', 11);
        //$this->Cell(0, 6, utf8_decode("Cédula Profesional: $cedula"), 0, 1, 'C');
        $this->Cell(0, 6, utf8_decode("Dirección: Patricio Sanz 442,\nCol. Del Valle Norte C.P.03103"), 0, 1, 'C');

        // Espacio después del encabezado
        $this->Ln(30);
    }
}

// Crear PDF
$pdf = new PDF();
//$pdf->fisioterapeuta = "José Pérez";
$pdf->AddPage();
$pdf->SetFont('Arial', '', 12);
$pdf->MultiCell(0, 10, $mensaje);

$nombreArchivo = 'Receta.pdf';
$pdf->Output('F', $nombreArchivo);

$mail = new PHPMailer(true);

try {
  $mail->isSMTP();
  $mail->Host = 'mail.kiox.mx';
  $mail->SMTPAuth = true;
  $mail->Username = 'hola@kiox.mx';
  $mail->Password = 'KA1]fXKS=jBT';
  $mail->SMTPSecure = 'ssl';
  $mail->Port = 465;

  $mail->setFrom('hola@kiox.mx', 'Receta');
  $mail->addAddress('vhunava@gmail.com');

  $mail->Subject = 'Nuevo formulario recibido';
  $mail->Body    = 'Adjunto encontrarás tu receta.';

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