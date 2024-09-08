import { NodeItem } from "../../Interfaces/NodeItem";
const pdfLogo: any = require('../assets/pdf.png');
const docxLogo: any = require('../assets/docx.png');
const pptxLogo: any = require('../assets/pptx.png');
const txtLogo: any = require('../assets/txt.png');
const pageLogo: any = require('../assets/browser.png');
const xlsxLogo: any = require('../assets/xlsx.png');

class DocumentService {
    public getDocumentIcon(item: NodeItem): string {
        if (item.Hyperlink) {
            if (item.Hyperlink.indexOf(".doc") !== -1 || item.Hyperlink.indexOf(".dot") !== -1) {
                return docxLogo;
            }
            else if (item.Hyperlink.indexOf(".xls") !== -1) {
                return xlsxLogo;
            }
            else if (item.Hyperlink.indexOf(".pdf") !== -1) {
                return pdfLogo;
            }
            else if (item.Hyperlink.indexOf(".ppt") !== -1) {
                return pptxLogo;
            }
            else if (item.Hyperlink.indexOf(".txt") !== -1) {
                return txtLogo;
            }
            else if (item.Hyperlink.indexOf(".aspx") !== -1) {
                return pageLogo;
            }
        }
        return pageLogo;
    }

    public getDocumentHyperlink(item: NodeItem): string {
        if (item.Hyperlink && item.Hyperlink.indexOf(".aspx") !== -1) {
            return item.Hyperlink;
        }

        if (item.DocumentClickBehavior === "Browser") {
            return item.Hyperlink;
        }
        if (item.DocumentClickBehavior === "Download") {
            return Documents.getFileDownloadUrl(item.Hyperlink);
        }

        if (item.Hyperlink) {
            return item.Hyperlink.indexOf(".pdf") !== -1 ? item.Hyperlink : Documents.getFileDownloadUrl(item.Hyperlink);
        }

        return "#";
    }

    public IsDownloadOnClick(item: NodeItem): boolean {
        return this.getDocumentHyperlink(item).indexOf("download.aspx") !== -1;
    }

    public getFileDownloadUrl(fileUrl: string) {
        if (fileUrl === "" || fileUrl == undefined || fileUrl == null) {
            return "";
        }
        try {
            const decodedFile = decodeURI(fileUrl);
            if (decodedFile.toLowerCase().indexOf(window.location.host.toLowerCase()) === -1) {
                // the file is hosted outside of our SharePoint tenant
                // we can't download it using download.aspx method
                return decodedFile;
            }
            const fileUrlParts = decodedFile.split("/");
            let fileSiteCollectionUrl = "https://" + fileUrlParts[2]; // root site
            if ((decodedFile.toLowerCase().indexOf("/sites/") !== -1) ||
                (decodedFile.toLowerCase().indexOf("/teams/") !== -1)) {
                fileSiteCollectionUrl += ("/" + fileUrlParts[3] + "/" + fileUrlParts[4]);
            }
            return fileSiteCollectionUrl + "/_layouts/download.aspx?SourceUrl=" + decodedFile;
        } catch (e) {
            console.log(e);
            return "";
        }
    }
}

export const Documents = new DocumentService();