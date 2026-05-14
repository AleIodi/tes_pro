<?php
require_once("../config.inc.php");
//
class Ajax extends AjaxManager{
	function select_data($mainid=null,$last_update=null){
		$this->__sendResult();
	}
	//
	function year(){
		$st_year_sql=sprintf("	SELECT DISTINCT
					to_char(st.date_start,'YYYY') AS value,
					to_char(st.date_start,'YYYY') AS text
					
					FROM
					service_task AS st
					
					ORDER BY
					text DESC");
		$st_year_res=$this->database->getRows($st_year_sql);
		//
		$this->__sendResult($st_year_res["rows"]);
	}
	//
	function month(){
		$rows = array(
			array("value" => 1,  "text" => "01 - Gennaio"),
			array("value" => 2,  "text" => "02 - Febbraio"),
			array("value" => 3,  "text" => "03 - Marzo"),
			array("value" => 4,  "text" => "04 - Aprile"),
			array("value" => 5,  "text" => "05 - Maggio"),
			array("value" => 6,  "text" => "06 - Giugno"),
			array("value" => 7,  "text" => "07 - Luglio"),
			array("value" => 8,  "text" => "08 - Agosto"),
			array("value" => 9,  "text" => "09 - Settembre"),
			array("value" => 10, "text" => "10 - Ottobre"),
			array("value" => 11, "text" => "11 - Novembre"),
			array("value" => 12, "text" => "12 - Dicembre"),
		);
		$this->__sendResult($rows);
	}
	//
	function form_confirm(){
		$value_arr=$this->getRequestVar("value_arr",null,false);
		//
		try{
			$this->database->initTransaction();
			//
			if(is_empty($value_arr)){
				throw new Exception("AJAX_ERROR_FORM_VALUES_NOT_FOUND");
			}
			//
			$year=(int)$value_arr["year"];
			$month=(int)$value_arr["month"];
			$start_date=sprintf("%s-%s-01 00:00:00",$year,$month);
			$end_date= date("Y-m-d H:i:s",strtotime("+1 month",strtotime($start_date)));
			//
			$str_sql=sprintf("	SELECT
						str.id AS str_id,
						st.id AS st_id,
						st.is_revision_wip AS is_revision_wip,
						cns.id AS cns_id,
						cns.code AS cns_code,
						cns.name AS cns_name,
						d.id AS d_id,
						d.code AS d_code,
						d.name AS d_name,
						str.code AS str_code,
						u.has_report_custom_folder AS u_has_report_custom_folder,
						u.username AS u_username
						
						FROM
						service_task_report AS str
						INNER JOIN service_task AS st		ON str.id_service_task=st.id
						INNER JOIN job_details AS jd		ON st.id_job_details=jd.id
						INNER JOIN job AS j			ON jd.id_job=j.id
						INNER JOIN consumer AS cns		ON j.id_consumer=cns.id
						INNER JOIN \"user\" AS u		ON st.id_user_creator=u.id
						
						LEFT JOIN consumer AS d			ON st.id_destination=d.id
						
						WHERE
						str.enabled=1
						AND
						st.enabled=1
						AND
						st.is_service_task_report_exported=0
						AND
						str.date_create>='%s'
						AND
						str.date_create<'%s'
						
						ORDER BY
						cns.name ASC,
						d.name ASC,
						str.id ASC
						",
						$start_date,
						$end_date
						);
			$str_res=$this->database->getRows($str_sql);
			//
			if($str_res["count"]==0){
				throw new Exception("AJAX_ERROR_NO_REPORTS_FOUND");
			}
			//
			$wip_count=0;
			$exportable_rows=array();
			foreach($str_res["rows"] as $str_row){
				if((int)$str_row["is_revision_wip"]===1){
					$wip_count++;
				}
				else{
					$exportable_rows[]=$str_row;
				}
			}
			//
			require_once(sprintf("%sbackend/reports/service_task_report/report_data.php",SWPATH));
			require_once(sprintf("%sfrontend/reports/service_task_report/report.php",SWPATH));
			//
			$base_path=sprintf("%s/%s-%s",$this->def_config["service_task_report_export_path"],sprintf("%02d",$month),$year);
			//
			//CREO STRUTTURA CARTELLE E RAPPORTINI
			//
			foreach($exportable_rows as $str_row){
				$cns_name=sprintf("%s",trim(preg_replace('/[^a-zA-Z0-9_\-\. ]/','',$str_row["cns_name"])));
				//
				if(!is_empty($str_row["d_code"])){
					$cns_name=sprintf("%s",preg_replace('/[^a-zA-Z0-9_\-\. ]/','',$str_row["d_name"]));
				}
				//
				$folder_custom="";
				if(((int)$str_row["u_has_report_custom_folder"])==1){
					$folder_custom=sprintf("%s/",$str_row["u_username"]);
				}
				//
				$folder=sprintf("%s/%s%s/",$base_path,$folder_custom,$cns_name);
				if(!is_dir($folder)){
					mkdir($folder,0775,true);
				}
				//
				$xpdf=new XPDFData_ServiceTaskReport($this->database,$this->def_manager,$this->mi,$this->def_config,$this->id_user,array("id_st"=>$str_row["st_id"]));
				$xpdf_data=$xpdf->getData();
				//
				$xpdf=new XPDF_ServiceTaskReport(array(),$xpdf_data);
				$xpdf->printPdf(sprintf("%s_%s.pdf",$xpdf_data["str_row"]["report_name"],$str_row["str_id"]),"file",null,1,false,$folder);
				//
				$st_arr=array(
					"id"=>$str_row["st_id"],
					"is_service_task_report_exported"=>"1",
				);
				$this->custom->serviceTask_Inup($st_arr,array("id"));
			}
			//
			$this->database->commitTransaction();
			//
			$this->__sendResult(array(
				"path"=>$base_path,
				"count"=>count($exportable_rows),
				"wip_count"=>$wip_count,
			));
		}
		catch(Exception $e){
			$this->database->rollbackTransaction();
			//
			throw $e;
		}
	}
}
//
$ajax=new Ajax($database,$page,$_REQUEST);
$ajax->__doMethod(array("dir"=>basename(__DIR__),"page"=>basename(__FILE__,".php")));
?>
