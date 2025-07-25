<?php
use PHPMailer\PHPMailer\PHPMailer;
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';
require 'PHPMailer/src/Exception.php';
require_once('tcpdf.php'); 

$nombre = $_POST['nombre'];
$email = $_POST['email'];
$mensaje = $_POST['mensaje'];
$TipoArchivo = utf8_decode($_POST['tipoDocumento']);

class PDF extends FPDF {
  public $fisioterapeuta;
  public $cedula;
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
        $this->Cell(0, 10, utf8_decode($this->fisioterapeuta), 0, 1, 'C');
        $this->SetFont('Arial', '', 11);
        $this->Cell(0, 6, utf8_decode("Cédula Profesional: $this->cedula"), 0, 1, 'C');
        $this->MultiCell(0, 6, utf8_decode('Dirección: Patricio Sanz 442,' . "\n" . 'Col. Del Valle Norte C.P.03103'), 0, 1, 'C');

        // Espacio después del encabezado
        $this->Ln(20);
    }
}

// Crear PDF
$pdf = new TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);
///////////
$pdf->SetCreator('Tu Nombre o App');
$pdf->SetAuthor('Autor del documento');
$pdf->SetTitle('Ejemplo con HTML');
$pdf->SetSubject('PDF generado desde HTML');
$pdf->SetKeywords('TCPDF, PDF, HTML, ejemplo');

$pdf->SetHeaderData('', 0, 'Mi Encabezado', 'Subtítulo o descripción');
$pdf->setHeaderFont(Array('helvetica', '', 10));
$pdf->setFooterFont(Array('helvetica', '', 8));
$pdf->SetDefaultMonospacedFont('courier');
$pdf->SetMargins(15, 27, 15);
$pdf->SetHeaderMargin(5);
$pdf->SetFooterMargin(10);
$pdf->SetAutoPageBreak(TRUE, 25);
$pdf->setImageScale(1.25);

// Añadir una página
$pdf->AddPage();

// Aquí va tu contenido HTML
$html = <<<EOD
<h1 style="color:#2e6c80;">Título principal</h1>
<p>Este es un <strong>párrafo</strong> con <em>estilo</em>, incluyendo <a href="https://openai.com">un enlace</a>.</p>
<ul>
    <li>Elemento 1</li>
    <li>Elemento 2</li>
</ul>
<p style="color:red;">¡Este texto está en rojo!</p>
EOD;

// Escribir el HTML al PDF
$pdf->writeHTML($html, true, false, true, false, '');

// Salida del PDF
$pdf->Output('documento_generado.pdf', 'I');










//////////
$pdf->fisioterapeuta = $_POST['nombreFisio'];
$pdf->cedula = $_POST['cedulaFisio'];
$pdf->AddPage();
$pdf->SetFont('Arial', '', 12);
$pdf->MultiCell(0, 10, strip_tags($mensaje));

$nombreArchivo = $TipoArchivo .'.pdf';
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