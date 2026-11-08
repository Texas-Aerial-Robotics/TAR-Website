from sklearn.feature_extraction.text import TfidfVectorizer
import joblib


class TfidfEncoder:
    """
    Encodes a list of text chunks using TF-IDF vectorization.
    Stores both the fitted vectorizer and resulting matrix.
    """

    def __init__(self, stopwords=True, min_df=1, max_df=1.0, ngram_range=(1, 1)):
        """
        Initialize the TF-IDF vectorizer with configurable parameters.

        Parameters:
        - stopwords (bool): If True, will be internally mapped to 'english'
          for sklearn
        - min_df (int or float): Minimum document frequency for tokens
        - max_df (int or float): Maximum document frequency for tokens
        - ngram_range (tuple): (1, 1) for unigrams, (1, 2) for
          unigrams + bigrams

        Note:
        - User must convert 'stopwords=True' to 'stop_words='english'' when
          initializing TfidfVectorizer.
        """
        stop_words = 'english' if stopwords else None
        self.vectorizer = TfidfVectorizer(
            stop_words=stop_words,
            min_df=min_df,
            max_df=max_df,
            ngram_range=ngram_range,
        )
        self.matrix = None
        self.documents = None

    def fit(self, documents):
        """
        Fit the TF-IDF vectorizer on a list of document chunks.

        This method must initialize:
        - self.matrix: the sparse TF-IDF matrix representing all document
          chunks
        - self.documents: the list of input documents to preserve order and
          mapping

        Parameters:
        - documents (List[str]): Cleaned document chunks
        """
        self.documents = list(documents)
        self.matrix = self.vectorizer.fit_transform(self.documents)

    def save(self, matrix_path='tfidf_matrix.pkl',
             vectorizer_path='tfidf_vectorizer.pkl'):
        """
        Save the TF-IDF matrix and vectorizer to disk.

        Parameters:
        - matrix_path (str): Path to save the document matrix
        - vectorizer_path (str): Path to save the fitted vectorizer
        """
        joblib.dump(self.matrix, matrix_path)
        joblib.dump(self.vectorizer, vectorizer_path)

    def load(self, matrix_path='tfidf_matrix.pkl',
             vectorizer_path='tfidf_vectorizer.pkl'):
        """
        Load the TF-IDF matrix and vectorizer from disk.

        Parameters:
        - matrix_path (str): Path to the saved matrix file
        - vectorizer_path (str): Path to the saved vectorizer file
        """
        self.matrix = joblib.load(matrix_path)
        self.vectorizer = joblib.load(vectorizer_path)
