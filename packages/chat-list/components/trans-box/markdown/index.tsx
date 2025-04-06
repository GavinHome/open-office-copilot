/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMermaid from './remark-mermaidjs/browser'
import rehypeMathjax from './rehype-mathjax/svg'

import BubbleMenu from '../bubble-menu';
import Table from './table';
import image from 'chat-list/utils/image';
import { NormalComponents } from 'react-markdown/lib/complex-types';
import { SpecialComponents } from 'react-markdown/lib/ast-to-react';
import ErrorBoundary from 'chat-list/components/error-boundary'
import styles from './index.module.css';
import cn from 'classnames';
import Image from './image';
import Code from './code';
import remarkMath from 'remark-math'

interface IMarkdownProps {
  copyContentBtn?: boolean;
  children: string;
  className?: string;
  components?: Partial<Omit<NormalComponents, keyof SpecialComponents> & SpecialComponents>;
  showTableMenu?: boolean;
  onInsertImage?: (img: HTMLImageElement, base64?: string) => void;
  selectedRange?: any;
}


function replaceImageLinks(markdownText: string,) {
  if (!markdownText) {
    return markdownText;
  }
  const regex = /(!{0,1})\[(.*?)\]\((.*?)\)/g;
  // 使用replace方法替换匹配到的图片链接
  const replacedText = markdownText.replace(regex, function (match, type = '', altText, imageUrl) {
    // match是整个匹配到的字符串，altText是第一个捕获组，即alt文本，imageUrl是第二个捕获组，即图片链接部分
    // 在这里你可以根据需要进行逻辑处理，例如替换成固定链接或者加上额外的参数
    const newImageUrl = image.get(imageUrl);
    if (newImageUrl) {
      return `![${altText}](${newImageUrl})`;
    }
    // 判断链接是否为图片链接，判断是base64图片，还是链接
    if (imageUrl.match(/\.(jpg|jpeg|png|gif|bmp)$/i) || imageUrl.match(/^data:image\//i)) {
      return `![${altText}](${imageUrl})`;
    }
    return `${type}[${altText}](${imageUrl})`;
  });

  return replacedText;
}
export default React.memo(function Markdown(props: IMarkdownProps) {
  const {
    copyContentBtn = true,
    children,
    className,
    components = {},
    showTableMenu = true,
    onInsertImage,
    selectedRange
  } = props;
  const [root, setRoot] = useState(null)
  const container = useRef();
  useEffect(() => {
    setRoot(container.current)
  }, []);
  const content = replaceImageLinks(children);
  return (
    <div className={cn(styles.container, className)}>
      <div ref={container}>
        <ErrorBoundary fallback={content}>
          <ReactMarkdown
            className="markdown"
            children={content}
            components={{
              pre: ({ ...props }: any) => {
                return <Code selectedRange={selectedRange} {...props}></Code>;
              },
              a: ({ ...props }: any) => {
                return <a target='_blank' {...props}></a>;
              },
              img: ({ node, ...props }: any) => {
                // console.log(props)
                return <Image {...props} onInsert={onInsertImage}></Image>;
              },
              table: ({ node, ...props }: any) => {
                return <Table showMenu={showTableMenu} {...props}></Table>;
              },
              ...components
            }}
            remarkPlugins={[remarkGfm, remarkMath, remarkMermaid]}
            rehypePlugins={[rehypeMathjax]}
          />
        </ErrorBoundary>

      </div>
      {copyContentBtn && (
        <BubbleMenu
          element={root}
          content={content}
        />
      )}
    </div>
  );
});
