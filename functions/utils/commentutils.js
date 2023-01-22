/** Returns all comments using the provided issue ID. */
export const fetchComments = async (lang, title) => {
    const response = await fetch(`/api/comments?id=${lang}&title=${title}`);
    const { data: comments, error } = await response.json();
    if (error) {
      throw new Error(error);
    }
    return comments;
  };
  
  /** Renders the given list of comments, converting markdown to HTML. */
  export const renderComments = async (comments) => {
    const commentsSection = document.querySelector('#storedcomments');
    const commentsWrapper = commentsSection.querySelector('#comments-wrapper');
    const commentsCounter = commentsSection.querySelector('#comments-count');
    const commentsPlaceholder = commentsSection.querySelector('#comments-placeholder');
  
    if (!comments.length) {
      commentsPlaceholder.innerHTML = `No comments yet.`;
      return;
    }
  
    commentsCounter.innerText = `${comments.length} `;
    const commentsList = document.createElement('ol');
    commentsList.className = 'stack gap-10';
    commentsList.innerHTML = comments
      .map((comment, i) => {
        const { user, isAuthor, datePosted, body } = comment;
        const authorPillId = `author-${i}`;
        return `<li>
                  <article class="post-comment stack gap-0">
                    <header class="post-comment-meta">
                        ${user}
                      <span class="fs-sm">
                        commented ${datePosted}
                      </span>
                      ${
                        isAuthor
                          ? `<span id="${authorPillId}" class="pill post-comment-author" data-shape="round" data-size="xs">Author</span>`
                          : ''
                      }
                    </header>
                    <div class="post-comment-body rhythm">${body}</div>
                  </article>
                </li>`;
      })
      .join('');
  
    commentsWrapper.innerHTML = '';
    commentsWrapper.appendChild(commentsList);
  };
  