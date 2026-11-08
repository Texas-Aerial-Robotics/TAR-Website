import os


class DocumentLoader:
    """
    Loads a .txt document and splits it into cleaned lines.
    """

    def __init__(self, filepath):
        self.filepath = filepath

    def load_and_split(self):
        """
        Load a .txt document and return its cleaned, non-empty lines.

        Raises:
        - ValueError: If file extension is not .txt
        - FileNotFoundError: If the file does not exist
        """
        if not os.path.isfile(self.filepath):
            raise FileNotFoundError("File does not exist.")

        ext = os.path.splitext(self.filepath)[1]
        if ext != ".txt":
            raise ValueError("File must be a .txt file.")

        file_data = []
        with open(self.filepath, encoding="utf-8") as load_file:
            for line in load_file:
                cleaned = self.preprocess(line)
                if cleaned:
                    file_data.append(cleaned)

        return file_data

    def preprocess(self, text):
        """
        Preprocess an individual line of text.

        Operations:
        - Lowercases all characters
        - Strips leading/trailing whitespace

        Parameters:
        - text (str): A raw line of text from the document

        Returns:
        - str: Cleaned version of the input text
        """
        return text.strip().lower()
