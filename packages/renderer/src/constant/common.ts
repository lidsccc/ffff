import { FileType } from "@/enums/fileType";
import PPTIcon from "@/assets/ppt.png";
import WordIcon from "@/assets/word.png";
import ExcelIcon from "@/assets/excel.png";
import MusicIcon from "@/assets/music.png";
import UnknowIcon from "@/assets/unknow.png";
import PdfIcon from "@/assets/pdf.png";
import TxtIcon from "@/assets/txt.png";

export const fileTypeIconMap = {
  [FileType.PPT]: PPTIcon,
  [FileType.PDF]: PdfIcon,
  [FileType.WORD]: WordIcon,
  [FileType.EXCEL]: ExcelIcon,
  [FileType.MUSIC]: MusicIcon,
  [FileType.TXT]: TxtIcon,
  [FileType.UNKOWN]: UnknowIcon,
};

export const DrawerSize = 400;
export const CreateDialogWidth = 610;
export const CreateDialogLabelWidth = 98;
export const CreateDialogContentHeight = 50;
