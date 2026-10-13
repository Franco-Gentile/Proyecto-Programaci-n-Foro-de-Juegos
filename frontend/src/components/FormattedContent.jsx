import { Link } from 'react-router-dom';

/**
 * Regex para detectar menciones @usuario y URLs https?://...
 */
const TOKEN_REGEX = /(@[a-zA-Z0-9_]{1,30})|(https?:\/\/[^\s]+)/g;

function FormattedContent({ content, className = '' }) {
  if (!content) return null;

  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = TOKEN_REGEX.exec(content)) !== null) {
    const matchStart = match.index;
    const matchText = match[0];

    // Texto antes del match
    if (matchStart > lastIndex) {
      parts.push(content.substring(lastIndex, matchStart));
    }

    if (matchText.startsWith('@')) {
      const username = matchText.slice(1);
      parts.push(
        <Link
          key={`mention-${matchStart}`}
          to={`/?search=${username}`}
          className="mention-tag"
          title={`Ver actividad de @${username}`}
          onClick={(e) => e.stopPropagation()}
        >
          @{username}
        </Link>
      );
    } else if (matchText.startsWith('http://') || matchText.startsWith('https://')) {
      parts.push(
        <a
          key={`link-${matchStart}`}
          href={matchText}
          target="_blank"
          rel="noopener noreferrer"
          className="content-link"
          onClick={(e) => e.stopPropagation()}
        >
          {matchText.length > 45 ? `${matchText.substring(0, 42)}...` : matchText}
        </a>
      );
    }

    lastIndex = matchStart + matchText.length;
  }

  // Texto restante
  if (lastIndex < content.length) {
    parts.push(content.substring(lastIndex));
  }

  return (
    <div className={`formatted-post-content ${className}`}>
      {parts}
    </div>
  );
}

export default FormattedContent;
