<?php
class ManagerEmail extends Manager{
	function sendEmail($param_arr=array()){
		require_once(DOCUMENT_ROOT."/".SHARK."/backend/components/PHPMailer/src/Exception.php");
		require_once(DOCUMENT_ROOT."/".SHARK."/backend/components/PHPMailer/src/PHPMailer.php");
		require_once(DOCUMENT_ROOT."/".SHARK."/backend/components/PHPMailer/src/SMTP.php");
		//
		if(
			is_empty($param_arr["host"]) ||
			is_empty($param_arr["port"]) ||
			is_empty($param_arr["from_name"]) ||
			is_empty($param_arr["from_email"]) ||
			is_empty($param_arr["to_email_arr"]) ||
			is_empty($param_arr["subject"]) ||
			is_empty($param_arr["message"])
		){
			throw new Exception("AJAX_ERROR_MAIL_PARAM_MISSING");
		}
		//
		$email=new PHPMailer;
		$email->isSMTP();
		$email->SMTPDebug=$param_arr["smtp_debug"]??0;//0=off(for production use).-1=client messages.-2=client and server messages
		$email->Host=$param_arr["host"];//es.smtp.office365.com: use $email->Host=gethostbyname('smtp.gmail.com'); //if your network does not support SMTP over IPv6
		$email->Port=$param_arr["port"];//es.587: TLS only
		$email->SMTPAuth=!is_empty($param_arr["smtp_auth"])?$param_arr["smtp_auth"]:true;
		$email->CharSet="UTF-8";
		//
		$email->SMTPSecure=isset($param_arr["smtp_secure"])?$param_arr["smtp_secure"]:"tls";//ssl is depracated
		$email->Username=$param_arr["username"]??$param_arr["from_email"]; //es. nome.cognome@4nextsolutions.com
		$email->Password=$param_arr["password"]??$param_arr["from_password"]??null;
		//
		$email->setFrom($param_arr["from_email"],$param_arr["from_name"]); //es. "nome.cognome@4nextsolutions.com","Nome Cognome"
		//
		foreach($param_arr["to_email_arr"] as $to_email){
			$email->addAddress($to_email,"");
		}
		//
		if(!is_empty($param_arr["to_email_cc_arr"])){
			foreach($param_arr["to_email_cc_arr"] as $to_email_cc){
				$email->addCc($to_email_cc,"");
			}
		}
		//
		if(!is_empty($param_arr["to_email_bcc_arr"])){
			foreach($param_arr["to_email_bcc_arr"] as $to_email_bcc){
				$email->addBcc($to_email_bcc,"");
			}
		}
		//
		if(!is_empty($param_arr["embedded_arr"])){
			foreach($param_arr["embedded_arr"] as $embedded){
				$email->addEmbeddedImage($embedded["url"],$embedded["code"]);
			}
		}
		//
		if(!is_empty($param_arr["attachment_arr"])){
			foreach($param_arr["attachment_arr"] as $attachment){
				$email->addAttachment($attachment["path"],$attachment["name"]??"");
			}
		}
		//
		$email->Subject=$param_arr["subject"]??"";
		$email->msgHTML($param_arr["message"]??""); //$email->msgHTML(file_get_contents('contents.html'), __DIR__); //Read an HTML message body from an external file, convert referenced images to embedded,
		$email->AltBody="HTML messaging not supported";
		//$email->addAttachment("images/phpmailer_mini.png"); //Attach an image file
		//
		if(!$email->send()){
			Log::write(Log::ERROR,"email",$email->ErrorInfo);
			//
			throw new Exception(sprintf("AJAX_ERROR_MAILER_{0}|%s",$email->ErrorInfo));
		}
		else{
			return array();
		}
	}
}
?>
