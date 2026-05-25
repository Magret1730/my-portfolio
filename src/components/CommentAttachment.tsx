"use client";

import styles from "@/components/Comments.module.scss";

type CommentAttachmentProps = {
  imageUrl: string;
};

export function CommentAttachment({ imageUrl }: CommentAttachmentProps) {
  return (
    <a
      href={imageUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.commentImageLink}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl} alt="Comment attachment" className={styles.commentImage} />
    </a>
  );
}
