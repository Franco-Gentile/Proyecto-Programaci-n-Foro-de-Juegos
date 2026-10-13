import { useState, useRef, useEffect, useCallback } from 'react';
import { searchUsers } from '../services/forumService';

function MentionTextarea({
  value,
  onChange,
  placeholder,
  rows = 4,
  maxLength,
  required = false,
  className = 'form-control',
  style = {},
  disabled = false,
}) {
  const textareaRef = useRef(null);
  const dropdownRef = useRef(null);

  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);
  const [searching, setSearching] = useState(false);

  // Buscar usuarios con debounce
  useEffect(() => {
    if (!mentionQuery) {
      setSuggestions([]);
      return;
    }

    let isMounted = true;
    const timer = setTimeout(async () => {
      try {
        setSearching(true);
        const results = await searchUsers(mentionQuery);
        if (isMounted) {
          setSuggestions(results);
          setSelectedIndex(0);
        }
      } catch {
        if (isMounted) setSuggestions([]);
      } finally {
        if (isMounted) setSearching(false);
      }
    }, 180);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [mentionQuery]);

  const detectMentionTrigger = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursor = textarea.selectionStart;
    const textBeforeCursor = value.slice(0, cursor);

    // Buscar el último '@' que no esté precedido de caracteres alfanuméricos
    const match = textBeforeCursor.match(/(?:^|[\s\n])@([a-zA-Z0-9_]*)$/);

    if (match) {
      const query = match[1];
      const matchIndex = textBeforeCursor.lastIndexOf(`@${query}`);
      setMentionStartIndex(matchIndex);
      setMentionQuery(query);
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
      setMentionQuery('');
      setMentionStartIndex(-1);
    }
  }, [value]);

  const handleChange = (e) => {
    onChange(e);
    setTimeout(detectMentionTrigger, 0);
  };

  const handleSelectUser = (user) => {
    if (!user || mentionStartIndex === -1) return;

    const textarea = textareaRef.current;
    const cursor = textarea.selectionStart;
    const beforeMention = value.slice(0, mentionStartIndex);
    const afterMention = value.slice(cursor);

    const inserted = `@${user.username} `;
    const newValue = `${beforeMention}${inserted}${afterMention}`;

    // Crear un evento simulado para onChange
    const event = {
      target: {
        value: newValue,
      },
    };
    onChange(event);

    setShowDropdown(false);
    setSuggestions([]);
    setMentionQuery('');

    // Restaurar cursor justo después de la mención
    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        const nextPos = beforeMention.length + inserted.length;
        textarea.setSelectionRange(nextPos, nextPos);
      }
    }, 10);
  };

  const handleKeyDown = (e) => {
    if (!showDropdown || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      handleSelectUser(suggestions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  // Cerrar si hace clic afuera
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        textareaRef.current &&
        !textareaRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div className="position-relative mention-textarea-wrapper">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        required={required}
        disabled={disabled}
        className={className}
        style={style}
      />

      {showDropdown && (suggestions.length > 0 || searching) && (
        <div
          ref={dropdownRef}
          className="mention-suggestions-dropdown"
          role="listbox"
        >
          <div className="mention-dropdown-header">
            👥 Mencionar usuario {searching && <span className="spinner-border spinner-border-sm ms-1"></span>}
          </div>
          {suggestions.map((u, idx) => (
            <div
              key={u.id}
              className={`mention-suggestion-item ${idx === selectedIndex ? 'active' : ''}`}
              onClick={() => handleSelectUser(u)}
              onMouseEnter={() => setSelectedIndex(idx)}
              role="option"
              aria-selected={idx === selectedIndex}
            >
              <span className="mention-user-avatar">🎮</span>
              <div className="mention-user-info">
                <span className="mention-username">@{u.username}</span>
                {u.role && u.role !== 'USER' && (
                  <span className="mention-role-badge">{u.role}</span>
                )}
              </div>
            </div>
          ))}
          {suggestions.length === 0 && !searching && (
            <div className="mention-empty-msg">No se encontraron usuarios</div>
          )}
        </div>
      )}
    </div>
  );
}

export default MentionTextarea;
