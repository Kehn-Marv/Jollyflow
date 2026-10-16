import React, { useState } from 'react';
import { cx } from '../../utils/styles';

interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Above-the-fold images load eagerly with high priority; everything else is lazy. */
  priority?: boolean;
  wrapperClassName?: string;
}

/**
 * Network-friendly image: lazy + async decode by default, a warm placeholder
 * while loading, and a soft fade-in so slow connections never show a broken flash.
 */
export function SmartImage({ priority = false, className, wrapperClassName, alt = '', onLoad, ...rest }: SmartImageProps) {
  const [loaded, setLoaded] = useState(false);
  return (
    <span className={cx('block h-full w-full overflow-hidden bg-sand', wrapperClassName)}>
      <img
        {...rest}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        // fetchpriority is supported by modern browsers; harmless elsewhere
        {...{ fetchpriority: priority ? 'high' : 'low' } as Record<string, string>}
        onLoad={(e) => {
          setLoaded(true);
          onLoad?.(e);
        }}
        className={cx('h-full w-full object-cover transition-opacity duration-500', loaded ? 'opacity-100' : 'opacity-0', className)} />
      
    </span>);

}