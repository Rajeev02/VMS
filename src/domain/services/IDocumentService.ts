export interface IDocumentService {
  /**
   * Generates a PDF of the visitor pass
   * @param passData The data to embed in the PDF
   * @returns A promise that resolves to the local URI of the generated PDF
   */
  generatePdf(passData: any): Promise<string>;

  /**
   * Triggers the native print dialog for a document URI
   * @param uri The local URI of the document to print
   */
  printDocument(uri: string): Promise<void>;

  /**
   * Generates a file from a string content (e.g. CSV) and shares it natively.
   * @param content The string content
   * @param filename The desired filename
   */
  generateAndShareCsv(content: string, filename: string): Promise<void>;
}
