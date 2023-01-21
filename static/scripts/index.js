const fetchComments = async (id) => {
    const response = await fetch(`/.netlify/functions/comments?id=${id}`);
    const { data: comments, error } = await response.json();
    if (error) {
      throw new Error(error);
    }
    return comments;
  };
  