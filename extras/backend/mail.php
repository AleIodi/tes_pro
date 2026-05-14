<?php
require_once("config.inc.php");
//
class WS_Act{
	public $database;
	public $def_manager;
	public $def_config;
	public $custom;
	//
	function __construct($database,$def_manager,$def_config,$custom){
		$this->database=$database;
		$this->def_manager=$def_manager;
		$this->def_config=$def_config;
		$this->custom=$custom;
	}
	//
	function doMethod($param_arr){
		//
		//CHECK PARAM
		//
		$mail_info_arr=$param_arr["data"]??null;
		//
		$environment_prefix=($_SERVER["HTTP_HOST"]=="localhost" || $_SERVER["HTTP_HOST"]=="phoenix" || getHostName()=="FNSSRV012") ? "dev" : "prod";
		//
		$subject="";
		$message="";
		$attachment_arr=array();
		if($mail_info_arr["mail_type"]=="SERVICE_TASK_REPORT"){
			$str_res=$this->database->getItem("service_task_report",array("id"=>$mail_info_arr["idr_service_task_report"]));
			//
			$subject=$mail_info_arr["subject"]??"Rapportino";
			//
			$link_firebase=$this->def_manager["service"]->serviceTaskReport_getUrl($str_res["id"]);
			$message=sprintf("Buongiorno, di seguito il link per procedere con la firma del rapportino in oggetto:<br/><br/><a href=\"%s\">Rapportino %s</a>",$link_firebase,$mail_info_arr["service_task_report_code"]);
			//
			//REPORT ATTACHMENT
			//
			$report_name="service_task_report";
			//
			//backend
			require_once(sprintf("%sbackend/reports/%s/report_data.php",SWPATH,$report_name));
			$xpdf=new XPDFData_ServiceTaskReport($this->database,$this->def_manager,null,$this->def_config,$this->custom->id_user,array(
				"id_st"=>$str_res["row"]["id_service_task"],
			));
			$xpdf_data=$xpdf->getData();
			//
			$str_filename=sprintf("%s.pdf",$xpdf_data["str_row"]["str_code"]);
			//
			//frontend
			require_once(sprintf("%sfrontend/reports/%s/report.php",SWPATH,$report_name));
			$xpdf=new XPDF_ServiceTaskReport(array(),$xpdf_data);
			$xpdf->printPdf($str_filename,"file",null,1,false,"/tmp/");
			//
			$attachment_arr=array(
				array("path"=>"/tmp/".$str_filename,"name"=>$str_filename),
			);
		}
		else if($mail_info_arr["mail_type"]=="AUTODOP_VERBAL"){
			$subject=$mail_info_arr["subject"]??"Verbale";
			//
			$link_firebase=$this->custom->autodopVerbal_getUrl($mail_info_arr["idr_autodop_verbal"]);
			$message=sprintf("Buongiorno, di seguito il link per visualizzaere il verbale:<br/><br/><a href=\"%s\">Verbale %s</a>",$link_firebase,$mail_info_arr["autodop_verbal_code"]);
		}
		else if($mail_info_arr["mail_type"]=="TICKET"){
			$subject=$mail_info_arr["subject"]??"Ticket";
			//
			$sc_info_sql=sprintf("	SELECT
						sc.*,
						sc.code AS sc_code,
						sc.description AS sc_description,
						cns.name AS cns_name,
						j.code AS j_code,
						scm_info.machine_list AS machine_list,
						scu_info.user_list AS user_list,
						TO_CHAR(sc.date_start, 'DD/MM/YYYY') AS sc_date,
						TO_CHAR(sc.date_start, 'HH24:MI') AS sc_time
						
						FROM
						service_call AS sc
						INNER JOIN consumer AS cns		ON sc.id_consumer=cns.id
						INNER JOIN job AS j			ON sc.id_job=j.id
						
						LEFT JOIN
						(
							SELECT
							scm.id_service_call,
							STRING_AGG(m.name,', ') AS machine_list
							
							FROM
							service_call_machine AS scm
							INNER JOIN machine AS m		ON scm.id_machine=m.id
							
							WHERE
							scm.enabled=1
							
							GROUP BY
							scm.id_service_call
						) AS scm_info
						ON
						scm_info.id_service_call=sc.id
						
						LEFT JOIN
						(
							SELECT
							scu.id_service_call,
							STRING_AGG(u.name_first || ' ' || u.name_last,', ') AS user_list
							
							FROM
							service_call_user AS scu
							INNER JOIN \"user\" AS u		ON scu.id_user=u.id
							
							WHERE
							scu.enabled=1
							
							GROUP BY
							scu.id_service_call
						) AS scu_info
						ON
						scu_info.id_service_call=sc.id
						
						WHERE
						sc.id=%s
						",
						$mail_info_arr["idr_service_call"]
						);
			$sc_info_res=$this->database->getRows($sc_info_sql);
			//
			$message=sprintf("	<b>Ticket %s<br/></b>
						Cliente: <b>%s</b><br/>
						Commessa: <b>%s</b><br/>
						Macchine: <b>%s</b><br/>
						Descrizione: <b>%s</b><br/>
						<br/>
						Appuntamento programmato:<br/>
						Giorno: <b>%s</b><br/>
						Orario: <b>%s</b><br/>
						Tecnici: <b>%s</b><br/>
						",
						$sc_info_res["rows"][0]["sc_code"],
						$sc_info_res["rows"][0]["cns_name"],
						$sc_info_res["rows"][0]["j_code"],
						$sc_info_res["rows"][0]["machine_list"],
						$sc_info_res["rows"][0]["sc_description"],
						$sc_info_res["rows"][0]["sc_date"],
						$sc_info_res["rows"][0]["sc_time"],
						$sc_info_res["rows"][0]["user_list"],
						);
		}
		else{
			$subject=$mail_info_arr["subject"]??"";
			$message=$mail_info_arr["msg_html"]??"";
		}
		//
		$email_param_arr=array(
			"host"=>$this->def_config[$environment_prefix."_mail_host"],
			"port"=>$this->def_config[$environment_prefix."_mail_port"],
			"smtp_auth"=>true,
			"smtp_secure"=>"tls",
			"smtp_debug"=>0,
			"username"=>$this->def_config[$environment_prefix."_mail_username"],
			"password"=>$this->def_config[$environment_prefix."_mail_password"],
			"from_name"=>$this->def_config[$environment_prefix."_mail_from_name"],
			"from_email"=>$this->def_config[$environment_prefix."_mail_from_mail"],
			//
			"to_email_arr"=>array_column($mail_info_arr["address_arr"],"email"),
			//
			"subject"=>$subject,
			"message"=>$message,
			//
			"attachment_arr"=>$attachment_arr,
		);
		$this->def_manager["email"]->sendEmail($email_param_arr);
		//
		return json_encode(array(
			"success"=>true,
			"error"=>null,
		));
	}
}
