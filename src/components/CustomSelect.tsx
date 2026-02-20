import React, { useState, useRef, useEffect } from 'react';
import { getTranslatedField } from '../utils/localeHelpers';

export interface SelectOption {
  value: string;
  label: string | { en: string; ar: string };
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  searchable?: boolean;
  required?: boolean;
  label?: string;
  width?: string;
  error?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
  searchable = true,
  required = false,
  label,
  width = '100%',
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Helper to get label as string
  const getLabel = (label: string | { en: string; ar: string }): string => {
    if (typeof label === 'string') return label;
    return getTranslatedField(label, '');
  };

  const selectedOption = options.find(opt => opt.value === value);

  const filteredOptions = options.filter(opt =>
    getLabel(opt.label).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current && searchable) {
      inputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    } else if (e.key === 'Enter' && filteredOptions.length > 0) {
      handleSelect(filteredOptions[0].value);
    }
  };

  return (
    <div style={{ width, display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {label && (
        <label style={{
          fontFamily: 'Nunito, sans-serif',
          fontWeight: 700,
          fontSize: '16px',
          lineHeight: '24px',
          color: '#061F42',
        }}>
          {label}{required && '*'}
        </label>
      )}
      
      <div 
        ref={containerRef}
        style={{
          position: 'relative',
          width: '100%',
        }}
      >
        {/* Select Trigger */}
        <div
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          tabIndex={disabled ? -1 : 0}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          style={{
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            padding: '10px 14px',
            minHeight: '44px',
            background: disabled ? '#F9FAFB' : '#FFFFFF',
            border: error 
              ? '2px solid #EF4444' 
              : isOpen 
                ? '2px solid #0155CB' 
                : '1.5px solid #D1D5DB',
            borderRadius: '10px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: isOpen 
              ? '0 4px 12px rgba(1, 85, 203, 0.15)' 
              : '0 1px 2px rgba(0, 0, 0, 0.05)',
            opacity: disabled ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            if (!disabled && !isOpen) {
              e.currentTarget.style.borderColor = '#0155CB';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(1, 85, 203, 0.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isOpen && !error) {
              e.currentTarget.style.borderColor = '#D1D5DB';
              e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
            }
          }}
        >
          {/* Selected Value or Placeholder */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <span style={{
              fontFamily: 'Nunito, sans-serif',
              fontSize: '14px',
              fontWeight: selectedOption ? 600 : 400,
              color: selectedOption ? '#061F42' : '#9CA3AF',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: 'block',
            }}>
              {selectedOption ? getLabel(selectedOption.label) : placeholder}
            </span>
          </div>

          {/* Clear Button */}
          {selectedOption && !disabled && (
            <div
              onClick={handleClear}
              style={{
                marginRight: '8px',
                padding: '4px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#F3F4F6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
          )}

          {/* Dropdown Arrow */}
          <div style={{
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            display: 'flex',
            alignItems: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path 
                d="M5 7.5L10 12.5L15 7.5" 
                stroke={isOpen ? '#0155CB' : '#6B7280'} 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Dropdown Menu */}
        <div
          role="listbox"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '6px',
            background: '#FFFFFF',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15), 0 2px 6px rgba(0, 0, 0, 0.05)',
            border: '1px solid #E5E7EB',
            zIndex: 9999,
            overflow: 'hidden',
            opacity: isOpen ? 1 : 0,
            visibility: isOpen ? 'visible' : 'hidden',
            transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.98)',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            transformOrigin: 'top center',
          }}
        >
          {/* Search Input */}
          {searchable && options.length > 5 && (
            <div style={{
              padding: '12px',
              borderBottom: '1px solid #F3F4F6',
              background: '#FAFAFA',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px 14px',
                background: '#FFFFFF',
                borderRadius: '8px',
                border: '1.5px solid #E5E7EB',
                transition: 'border-color 0.2s ease',
              }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ marginRight: '10px', flexShrink: 0 }}>
                  <path d="M16.5 16.5L12.375 12.375M14.25 8.25C14.25 11.5637 11.5637 14.25 8.25 14.25C4.93629 14.25 2.25 11.5637 2.25 8.25C2.25 4.93629 4.93629 2.25 8.25 2.25C11.5637 2.25 14.25 4.93629 14.25 8.25Z" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search..."
                  style={{
                    flex: 1,
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    fontFamily: 'Nunito, sans-serif',
                    fontSize: '14px',
                    color: '#374151',
                  }}
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div style={{
            maxHeight: '240px',
            overflowY: 'auto',
            padding: '6px',
          }}>
            {filteredOptions.length === 0 ? (
              <div style={{
                padding: '20px',
                textAlign: 'center',
                color: '#9CA3AF',
                fontFamily: 'Nunito, sans-serif',
                fontSize: '14px',
              }}>
                {options.length === 0 ? 'No options available' : 'No results found'}
              </div>
            ) : (
              filteredOptions.map((option, index) => (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  role="option"
                  aria-selected={value === option.value}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: value === option.value 
                      ? 'linear-gradient(135deg, #EBF5FF 0%, #E0F2FE 100%)' 
                      : 'transparent',
                    transition: 'all 0.15s ease',
                    marginBottom: index === filteredOptions.length - 1 ? 0 : '2px',
                  }}
                  onMouseEnter={(e) => {
                    if (value !== option.value) {
                      e.currentTarget.style.background = '#F3F4F6';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = value === option.value 
                      ? 'linear-gradient(135deg, #EBF5FF 0%, #E0F2FE 100%)' 
                      : 'transparent';
                  }}
                >
                  {/* Check Icon for Selected */}
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: value === option.value ? 'none' : '2px solid #D1D5DB',
                    background: value === option.value 
                      ? 'linear-gradient(135deg, #0155CB 0%, #0B67E7 100%)' 
                      : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease',
                    flexShrink: 0,
                  }}>
                    {value === option.value && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  
                  <span style={{
                    fontFamily: 'Nunito, sans-serif',
                    fontSize: '14px',
                    fontWeight: value === option.value ? 600 : 500,
                    color: value === option.value ? '#0155CB' : '#374151',
                    flex: 1,
                  }}>
                    {getLabel(option.label)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <span style={{
            fontFamily: 'Nunito, sans-serif',
            fontSize: '12px',
            color: '#EF4444',
            marginTop: '4px',
          }}>
            {error}
          </span>
        )}
      </div>
    </div>
  );
};

export default CustomSelect;
