<?php
class ManagerNotification extends Manager{
	function send($id_notification_typology,$title,$text,$transaction_parent=false){
		try{
			$this->database->initTransaction();
			//
			$n_arr=array(
				"id_notification_typology"=>$id_notification_typology,
				"title"=>$title,
				"text"=>$text,
				"date_sent"=>"now()",
			);
			$n_res=$this->database->inup("notification",$n_arr,array(),true);
			//
			$u_sql=sprintf("	SELECT DISTINCT
						u.*
						
						FROM
						\"user\" AS u,
						user_group_link AS ugl,
						notification_typology_user_group AS ntug
						
						WHERE
						ugl.id_user=u.id
						AND
						ugl.id_user_group=ntug.id_user_group
						AND
						ntug.id_notification_typology=%s
						AND
						ntug.wms_enabled=1
						",
						$n_res["id"]
						);
			$u_res=$this->database->getRows($u_sql);
			//
			if($u_res["count"]>0){
				foreach($u_res["rows"] as $u_row){
					$nu_arr=array(
						"id_notification"=>$n_res["id"],
						"id_user"=>$u_row["id"],
					);
					$this->database->inup("notification_user",$nu_arr,array(),true);
				}
			}
			//
			$this->database->commitTransaction();
		}
		catch(Exception $e){
			$this->database->rollbackTransaction();
			//
			throw $e;
		}
	}
	//
	function getNotificationInfoRows($id_user,$only_not_checked=false,$priority=null){
		$where_only_not_checked="";
		if($only_not_checked){
			$where_only_not_checked=sprintf(" AND nu.is_checked=0 ");
		}
		//
		$where_priority="";
		if(!is_empty($priority)){
			$where_priority.=sprintf(" AND ntp.code='%s' ",$priority);
		}
		//
		$nu_info_sql=sprintf("	SELECT
					nu.id AS mainid,
					nu.*,
					n.title AS n_title,
					n.text AS n_text,
					n.date_sent AS n_date_sent,
					nt.code AS nt_code,
					CASE WHEN nu.is_checked=0 THEN 1 ELSE 0 END AS row_blue,
					ntp.label AS ntp_label,
					ntp.id AS ntp_id
					
					FROM
					notification_user AS nu,
					notification AS n,
					notification_typology AS nt,
					notification_typology_priority AS ntp
					
					WHERE
					nu.id_notification=n.id
					AND
					n.id_notification_typology=nt.id
					AND
					nt.id_notification_typology_priority=ntp.id
					AND
					nu.id_user=%s
					%s
					%s
					
					ORDER BY
					n.date_sent DESC
					",
					$id_user,
					$where_only_not_checked,
					$where_priority
					);
		$nu_info_res=$this->database->getRows($nu_info_sql);
		//
		return $nu_info_res["rows"]??array();
	}
	//
	function setNotificationChecked($nu_row,$bypass=false,$transaction_parent=null){
		try{
			$this->database->initTransaction();
			//
			$nu_row=$this->database->refreshRow("notification_user",$nu_row,array("id"),$bypass,"AJAX_ERROR_NOTIFICATION_USER_NOT_FOUND");
			//
			$nu_arr=array(
				"id"=>$nu_row["id"],
				"is_checked"=>1,
				"date_checked"=>"now()",
			);
			$this->database->inup("notification_user",$nu_arr,array("id"));
			//
			$this->database->commitTransaction();
		}
		catch(Exception $e){
			$this->database->rollbackTransaction();
			//
			throw $e;
		}
	}
	//
	function setNotificationTypologyUserGroup($id_notification_typology_arr,$id_user_group,$param_arr=array(),$transaction_parent=null){
		try{
			$this->database->initTransaction();
			//
			$param_arr=array(
				"wms_enabled"=>!is_empty($param_arr["wms_enabled"])?$param_arr["wms_enabled"]:null,
				"push_enabled"=>!is_empty($param_arr["push_enabled"])?$param_arr["push_enabled"]:null,
				"email_enabled"=>!is_empty($param_arr["email_enabled"])?$param_arr["email_enabled"]:null,
				"telegram_enabled"=>!is_empty($param_arr["telegram_enabled"])?$param_arr["telegram_enabled"]:null,
			);
			//
			foreach($id_notification_typology_arr as $id_notification_typology){
				$ntug_arr=array(
					"id_notification_typology"=>$id_notification_typology,
					"id_user_group"=>$id_user_group,
					//
					"wms_enabled"=>$param_arr["wms_enabled"]?"1":"0",
					"push_enabled"=>$param_arr["push_enabled"]?"1":"0",
					"email_enabled"=>$param_arr["email_enabled"]?"1":"0",
					"telegram_enabled"=>$param_arr["telegram_enabled"]?"1":"0",
				);
				$this->database->inup("notification_typology_user_group",$ntug_arr,array("id_notification_typology","id_user_group"));
			}
			//
			$this->database->commitTransaction();
		}
		catch(Exception $e){
			$this->database->rollbackTransaction();
			//
			throw $e;
		}
	}
}
?>
