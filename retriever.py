from sklearn.metrics.pairwise import cosine_similarity
import numpy as np


class TfidfRetriever:
    """
    Given a query, this class retrieves the most relevant document chunks
    using cosine similarity.
    """

    def __init__(self, vectorizer, matrix, documents):
        """
        Initialize with a fitted TF-IDF vectorizer, encoded matrix, and the
        original documents.

        Parameters:
        - vectorizer (TfidfVectorizer): Fitted TF-IDF vectorizer
        - matrix (sparse matrix): Document-term TF-IDF matrix
        - documents (List[str]): Original document chunks (text)
        """
        self.vectorizer = vectorizer
        self.matrix = matrix
        self.documents = documents

    def retrieve(self, query, top_k=3):
        """
        Retrieves the top-k document chunks that are most relevant to the
        input query.

        Parameters:
        - query (str): The user's natural language question
        - top_k (int): Number of top matching chunks to return

        Returns:
        - List[Dict]: Each dict in the result list has the following
          structure:
            {
                "score": float,  # Cosine similarity score between
                                 # query and chunk
                "text": str      # The matched document chunk content
            }

        Notes:
        - Query should be lowercased to match preprocessed documents.
        - Raise ValueError if the query is empty or shorter than 3
          characters.
        """
        if query is None or len(query.strip()) < 3:
            raise ValueError(
                "Query is empty or shorter than 3 characters."
            )
        query = query.strip().lower()
        query_vector = self.vectorizer.transform([query])
        scores = cosine_similarity(query_vector, self.matrix).ravel()
        top_indices = np.argsort(-scores, kind="mergesort")[:top_k]
        return [
            {
                "score": float(scores[index]),
                "text": self.documents[index],
            }
            for index in top_indices
        ]
