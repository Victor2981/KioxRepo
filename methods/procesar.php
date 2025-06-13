<?php
use PHPMailer\PHPMailer\PHPMailer;
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';
require 'PHPMailer/src/Exception.php';
require_once('tcpdf/src/tcpdf.php'); // Asegúrate de que esta ruta sea correcta

$nombre = $_POST['nombre'];
$email = $_POST['email'];
$mensaje = $_POST['mensaje'];
$TipoArchivo = $_POST['tipoDocumento'];
$nombreFisio = $_POST['nombreFisio'];
$cedulaFisio = $_POST['cedulaFisio'];

// Crear una subclase de TCPDF para personalizar encabezado
class MYPDF extends TCPDF {
    public $fisioterapeuta;
    public $cedula;

    // Cabecera
    public function Header() {
        // Logo
        $image_file = '../img/logoKiox.png';
        $this->Image($image_file, 10, 10, 30, '', 'PNG', '', 'T', false, 300, '', false, false, 0, false, false, false);

        // Fecha en esquina superior derecha
        $this->SetFont('helvetica', '', 10);
        $this->SetXY(-60, 10);
        $this->Cell(50, 10, date('d/m/Y'), 0, 0, 'R');

        // Título centrado
        $this->SetY(20);
        $this->SetFont('helvetica', 'B', 12);
        $this->Cell(0, 6, $this->fisioterapeuta, 0, 1, 'C');
        $this->SetFont('helvetica', '', 11);
        $this->Cell(0, 6, "Cédula Profesional: " . $this->cedula, 0, 1, 'C');
        $this->MultiCell(0, 6, "Dirección: Patricio Sanz 442,\nCol. Del Valle Norte C.P.03103", 0, 'C');
        $this->Ln(10);
    }
}

// Crear PDF
$pdf = new MYPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);
$pdf->fisioterapeuta = $nombreFisio;
$pdf->cedula = $cedulaFisio;
$pdf->SetCreator(PDF_CREATOR);
$pdf->SetAuthor($nombreFisio);
$pdf->SetTitle($TipoArchivo);
$pdf->SetMargins(15, 40, 15); // margen superior 40 para dejar espacio al header
$pdf->AddPage();
$pdf->SetFont('helvetica', '', 12);
$pdf->writeHTML(nl2br(strip_tags($mensaje)), true, false, true, false, '');

$nombreArchivo = $TipoArchivo . '.pdf';
$pdf->Output($nombreArchivo, 'F');

// Enviar por correo
$mail = new PHPMailer(true);
try {
    $mail->isSMTP();
    $mail->Host = 'mail.kiox.mx';
    $mail->SMTPAuth = true;
    $mail->Username = 'hola@kiox.mx';
    $mail->Password = 'KA1]fXKS=jBT';
    $mail->SMTPSecure = 'ssl';
    $mail->Port = 465;

    $mail->setFrom('hola@kiox.mx', $TipoArchivo);
    $mail->addAddress($email);
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
