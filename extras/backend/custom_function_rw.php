<?php
class CustomRw{
	public db $database;
	public mixed $def_config;
	public mixed $def_manager;
	public CustomFunction $custom;
	public bool $enabled;
	//
	public dbSqlsrv $database_erp;
	//
	function __construct($database,$def_config,$def_manager,$custom){
		$this->database=$database;
		$this->def_config=$def_config;
		$this->def_manager=$def_manager;
		$this->custom=$custom;
	}
	//
	function init(){
		$this->enabled=(((int)$this->def_config[SWNAME."_erp_sync_enabled"])==1);
		//
		if(!$this->enabled){
			echo "\n\nERP SYNC NOT ENABLED IN CONFIGURATION\n\n";
			//
			exit(0);
		}
		//
		require_once(DOCUMENT_ROOT."/".SHARK."/backend/classes/database_sqlsrv.php");
		//
		$this->database_erp=new dbSqlsrv($this->def_config[SWNAME."_erp_db"],$this->def_config[SWNAME."_erp_user"],$this->def_config[SWNAME."_erp_password"],$this->def_config[SWNAME."_erp_server"],array(
			"InterventiOre"=>array("IDIntervento"),
			"RaportinoViaggi"=>array("IDRapportino","IDViaggi"),
			"RapportiniProdotti"=>array("IDRapportino","IDProdotti"),
			"RapportiniSpese"=>array("IDRapportino","IDSpese"),
			"RapportinoOreUtenti"=>array("IDRapportino","IDOperazione"),
			"RapportinoOreUtentiMatricole"=>array("IDRapportino","IDOperazione","Matricola"),
			"RapportinoTestata"=>array("IDRapportino"),
			"Utenti"=>array("IDReady"),
			"Articoli"=>array("IDReady"),
			"Aziende"=>array("IDReady"),
			"Azioni"=>array("IDReady"),
			"Commesse"=>array("IDReady"),
			"Matricole"=>array("IDReady"),
		));
	}
	//
	function getTextFixed($text){
		return PHP4NS::trim($text);
	}
	//
	function sync_TruckStock($id_truck=null,$is_debug=false){
		try{
			$this->database->initTransaction();
			//
			$where_CodiceFurgone="";
			$where_delete_truck_stock="";
			//
			if(!is_empty($id_truck)){
				$t_res=$this->database->getItem("truck",array("id"=>$id_truck));
				//
				$where_CodiceFurgone=sprintf("AND far.CodiceFurgone='%s'",$t_res["row"]["code"]);
				$where_delete_truck_stock=sprintf("AND id_truck=%s",$t_res["id"]);
			}
			//
			$erp_ts_sql=sprintf("	SELECT
						far.CodiceFurgone AS CodiceFurgone,
						far.CodiceArticolo AS CodiceArticolo,
						far.Giacenza AS qnt_tot,
						COALESCE(rp_info.qnt_tot,0) AS qnt_not_processed,
						far.Giacenza-COALESCE(rp_info.qnt_tot,0) AS qnt_free
						
						FROM
						vFurgoniArticoliReady AS far
						
						LEFT JOIN
						(	SELECT
							rp.CodiceFurgone,
							rp.CodiceArticolo,
							SUM(rp.quantita) AS qnt_tot
							
							FROM
							RapportiniProdotti AS rp
							INNER JOIN RapportinoTestata AS rt		ON rp.IDRapportino=rt.IDRapportino AND rt.Stato=0
							
							WHERE
							rp.isDeleted=0
							
							GROUP BY
							rp.CodiceFurgone,
							rp.CodiceArticolo
						) AS rp_info
						ON
						far.CodiceArticolo=rp_info.CodiceArticolo
						AND
						far.CodiceFurgone=rp_info.CodiceFurgone
						
						WHERE
						far.Giacenza>0
						%s
						
						ORDER BY
						far.CodiceFurgone ASC,
						far.CodiceArticolo ASC
						",
						$where_CodiceFurgone
						);
			$erp_ts_res=$this->custom->custom_rw->database_erp->getRows($erp_ts_sql);
			//
			//CANCELLO GIACENZE ATTUALI
			//
			$this->database->delete(sprintf("DELETE FROM truck_stock WHERE 1=1 %s;",$where_delete_truck_stock));
			//
			//IMPORTO NUOVE GIACENZE
			//
			if($erp_ts_res["count"]>0){
				foreach($erp_ts_res["rows"] as $erp_ts_row){
					$t_row=$this->database->getItem("truck",array("code"=>$this->custom->custom_rw->getTextFixed($erp_ts_row["CodiceFurgone"])));
					if(is_empty($t_row["id"])){
						if($is_debug)echo sprintf("\nFurgone %s non trovato",$erp_ts_row["CodiceFurgone"]);
						//
						continue;
					}
					//
					$p_row=$this->database->getItem("product",array("article"=>$this->custom->custom_rw->getTextFixed($erp_ts_row["CodiceArticolo"])));
					if(is_empty($p_row["id"])){
						if($is_debug)echo sprintf("\nProdotto %s non trovato",$erp_ts_row["CodiceArticolo"]);
						//
						continue;
					}
					//
					$stp_not_sent_sql=sprintf("	SELECT
									1
									
									FROM
									service_task_product AS stp
									INNER JOIN service_task AS st		ON stp.id_service_task=st.id
									
									WHERE
									stp.id_product=%s
									AND
									st.id_truck=%s
									AND
									st.sent_to_erp<2
									",
									$t_row["id"],
									$p_row["id"]
									);
					$erp_ts_res=$this->custom->database->getRows($stp_not_sent_sql);
					//
					$ts_arr=array(
						"id_truck"=>$t_row["id"],
						"id_product"=>$p_row["id"],
						"qnt"=>(int)$erp_ts_row["qnt_free"],
						"qnt_erp"=>(int)$erp_ts_row["qnt_tot"],
					);
					$this->database->inup("truck_stock",$ts_arr,array("id_truck","id_product"));
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
}
?>
