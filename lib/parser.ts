import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

export type ParsedFile = {
  text: string;
};

const normalizeText = (text: string): string =>
  text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();

export const extractTextFromBuffer = async (
  buffer: Buffer,
  mimeType: string
): Promise<ParsedFile> => {
  try {
    if (mimeType === "application/pdf") {
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      await parser.destroy();
      return { text: normalizeText(result.text ?? "") };
    }

    if (
      mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      mimeType === "application/msword"
    ) {
      const result = await mammoth.extractRawText({ buffer });
      return { text: normalizeText(result.value ?? "") };
    }

    return { text: "" };
  } catch {
    return { text: "" };
  }
};
