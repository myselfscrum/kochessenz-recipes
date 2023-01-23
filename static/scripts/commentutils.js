/** Returns all comments using the provided issue ID. */
export const fetchComments = async (lang, title) => {
    const response = await fetch(`/.netlify/functions/comments?lang=${lang}&title=${title}`);
    const { data: comments, error } = await response.json();

    return comments;
  };
  
  /** Renders the given list of comments, converting markdown to HTML. */
  export const renderComments = async (comments, nocomment, commented, onecomment, manycomments) => {
    const commentsSection = document.querySelector('#storedcomments');
    const commentsWrapper = commentsSection.querySelector('#comments-wrapper');
    const commentsCounter = commentsSection.querySelector('#comments-count');
    const commentsPlaceholder = commentsSection.querySelector('#comments-placeholder');
  
    if (!comments.length) {
      commentsPlaceholder.innerHTML = nocomment;
      return;
    }
  
    commentsCounter.innerText = `${comments.length} ${comments.length == 1 ? onecomment : manycomments} `;
    const commentsList = document.createElement('ol');
    commentsList.className = 'stack gap-10';
    commentsList.innerHTML = comments
      .map((comment, i) => {
        const { user, isAuthor, datePosted, body } = comment;
        return `<li>
                  <article class="post-comment stack gap-0">
                    <header class="post-comment-meta">
                        ${user}
                      <span class="fs-sm">
                        ${commented} ${datePosted}
                      </span>
                      ${
                        isAuthor
                          ? `<span class="pill">Author</span>`
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
  