<?php
require_once(DOCUMENT_ROOT."/".SHARK."/frontend/components/mpdf/vendor/autoload.php");
require_once(DOCUMENT_ROOT."/".SHARK."/frontend/components/mpdf/vendor/qrcode/vendor/autoload.php");
ini_set("pcre.backtrack_limit", "5000000");
//
class XPDF extends \Mpdf\Mpdf{
	private $header_html;
	private $header_repeat;
	//
	private $footer_html;
	private $footer_repeat;
	private $is_finished;
	//
	private $pages_html;
	//
	public function __construct($mpdf_config=array()){
		$mpdf_config_default=array(
			"tempDir"=>"/tmp",
			"mode"=>"utf-8",
			"format"=>"A4",
			"orientation"=>"P",
			"default_font"=>"dejavusans",
			//
			"autoMarginPadding"=>"0",
			"setAutoTopMargin"=>"stretch",
			"setAutoBottomMargin"=>"stretch",
			//
			"margin_left"=>8,
			"margin_right"=>8,
		);
		$mpdf_config=array_merge($mpdf_config_default,$mpdf_config);
		//
		parent::__construct($mpdf_config);
		//
		$xpdf_css=file_get_contents(DOCUMENT_ROOT."/".SHARK."/frontend/classes/styles/css/xpdf.css");
		$this->setStyleCss($xpdf_css);
		//
		$this->header_html=null;
		$this->header_repeat=false;
		//
		$this->footer_html=null;
		$this->footer_repeat=false;
		$this->is_finished=false;
		//
		$this->pages_html=null;
	}
	//
	//###########################################################################################################################################
	//HEADER
	//###########################################################################################################################################
	//
	public function setHeaderHtml($header_html,$header_repeat=false,$colspan_max=120){
		$header_html=$this->replaceHtmlFields($header_html,$colspan_max);
		//
		$this->header_html=$header_html;
		$this->header_repeat=$header_repeat;
		//
		$this->SetHTMLHeader($this->header_html);
	}
	//
	function Header($header_html=""){
		if($this->header_repeat || $this->PageNo()==1){
			parent::Header($header_html);
		}
		else{
			$this->SetY(10);
		}
	}
	//
	//###########################################################################################################################################
	//FOOTER
	//###########################################################################################################################################
	//
	public function setFooterHtml($footer_html,$footer_repeat=false,$colspan_max=120){
		$footer_html=$this->replaceHtmlFields($footer_html,$colspan_max);
		//
		$this->footer_html=$footer_html;
		$this->footer_repeat=$footer_repeat;
	}
	//
	function Footer(){
		if($this->footer_repeat || $this->is_finished)
			parent::Footer();
	}
	//
	//###########################################################################################################################################
	//PAGE
	//###########################################################################################################################################
	//
	public function setPage($page_html,$doc_index=0,$save_html=false,$colspan_max=120,$preserve_page_num=false){
		if($doc_index>0){
			$this->addPageByArray(array("resetpagenum"=>($preserve_page_num?"0":"1")));
		}
		//
		if($this->footer_html){
			$this->SetHTMLFooter($this->footer_html);
		}
		//
		$page_html=$this->replaceHtmlFields($page_html,$colspan_max);
		if($save_html){
			file_put_contents("/tmp/xpdf_page.html",$page_html);
		}
		//
		$this->pages_html=($this->pages_html??"").$page_html;
		$this->WriteHTML($page_html);
		//
		$this->is_finished=true;
	}
	//
	public function printPdf($filename,$print_action,$printer_name=null,$copies=1,$is_book_print=false,$path="/tmp/"){
		$mpdf=$this;
		//
		if($is_book_print){
			$file_tmp=tmpfile();
			$file_tmp_info_arr=stream_get_meta_data($file_tmp);
			//
			$this->Output($file_tmp_info_arr["uri"],"F");
			$mpdf=$this->convertPdfIntoXpdfBook($file_tmp_info_arr["uri"]);
			//
			fclose($file_tmp);
		}
		//
		if($print_action=="inline"){
			$mpdf->Output($filename,"I");
		}
		else if($print_action=="download"){
			$mpdf->Output($filename,"D");
		}
		else if($print_action=="file"){
			$mpdf->Output(sprintf("%s%s",$path,$filename),"F");
		}
		else if($print_action=="print"){
			ob_clean();//Aggiunto da akerlund
			//
			$mpdf->Output(sprintf("%s%s",$path,$filename),"F");
			//
			if(is_empty($printer_name)){
				throw new Exception("AJAX_ERROR_PRINTER_NOT_FOUND");
			}
			//
			passthru(sprintf("lp -d %s -n %s -o Collate=True %s > /dev/null 2>&1 &",$printer_name,$copies,sprintf("%s%s",$path,$filename)));
		}
		else if($print_action=="preview"){
			echo $this->pages_html;
		}
	}
	//
	//###########################################################################################################################################
	//CSS
	//###########################################################################################################################################
	//
	public function setStyleCss($style_css){
		$this->WriteHTML($style_css,\Mpdf\HTMLParserMode::HEADER_CSS);
	}
	//
	//###########################################################################################################################################
	//UTILS
	//###########################################################################################################################################
	//
	public function replaceFields($html,$replace_arr){
		foreach($replace_arr as $replace_k=>$replace_v){
			if($replace_v=="###EMPTY###"){
				$replace_v="";
			}
			//
			$html=PHP4NS::preg_replace("/\[\[".$replace_k."\]\]/",$replace_v??"",$html);
		}
		//
		return $html;
	}
	//
	private function replaceHtmlFields($html,$colspan_max=120){
		//
		//TABLE_INIT
		//
		$width_fixed=number_format((((float)100)/((float)$colspan_max)),3);
		$table_init_td_html=sprintf("<td width=\"%s%%\" colspan=\"1\"></td>",$width_fixed); //border: 0
		$table_init_td_html_repeat="";
		//
		foreach(range(1,$colspan_max) as $i){
			$table_init_td_html_repeat.=$table_init_td_html;
		}
		//
		//REPLACE
		//
		$replace_arr=array(
			"__DOCUMENT_ROOT__"=>DOCUMENT_ROOT,
			"__SWNAME__"=>SWNAME,
			"__TABLE_INIT__"=>sprintf("<tr class=\"tr-ruler\">%s</tr>",$table_init_td_html_repeat),
		);
		//
		$html=$this->replaceFields($html,$replace_arr);
		//
		return $html;
	}
	//
	//dato un file PDF, crea nuovo XPDF in formato A4 landscape con 2 pagine A5 per foglio
	private function convertPdfIntoXpdfBook($filename){
		$mpdf=new XPDF([
			"format"=>"A4",
			"orientation"=>"L",
		]);
		$mpdf->SetDisplayMode("fullpage");
		//
		$page_width=$mpdf->w/2;
		$page_height=$mpdf->h;
		$page_count=$mpdf->setSourceFile($filename);
		//
		$np_A4=1;
		$np_A5=1;
		$page_per_sheet_arr=array();
		//
		while($np_A5<=$page_count){
			$page_per_sheet_arr[$np_A4][]=$np_A5;
			//
			if($np_A5%2==0){
				$np_A4++;
			}
			//
			$np_A5++;
		}
		//
		foreach($page_per_sheet_arr as $page_per_sheet){
			$mpdf->AddPage();
			//
			if($page_per_sheet[0]>0 && $page_per_sheet[0]<=$page_count){
				$id_template=$mpdf->importPage($page_per_sheet[0]);
				$mpdf->UseTemplate($id_template,0,0,$page_width,$page_height);
			}
			//
			if($page_per_sheet[1]>0 && $page_per_sheet[1]<=$page_count){
				$id_template=$mpdf->importPage($page_per_sheet[1]);
				$mpdf->UseTemplate($id_template,$page_width,0,$page_width,$page_height);
			}
		}
		//
		return $mpdf;
	}
}
?>
