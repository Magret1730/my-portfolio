"use client";

import Image from "next/image";
import { useState } from "react";

import styles from "@/components/Comments.module.scss";
import { isAllowedBlobUrl } from "@/lib/blob-url";

type CommentAttachmentProps = {
  imageUrl: string;
};

export function CommentAttachment({ imageUrl }: CommentAttachmentProps) {
  const [useFallback, setUseFallback] = useState(!isAllowedBlobUrl(imageUrl));

  if (useFallback) {
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

  return (
    <a
      href={imageUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.commentImageLink}
    >
      <Image
        src={imageUrl}
        alt="Comment attachment"
        width={1200}
        height={900}
        className={styles.commentImage}
        sizes="(max-width: 768px) 100vw, 640px"
        style={{ width: "100%", height: "auto", maxHeight: 320, objectFit: "contain" }}
        onError={() => setUseFallback(true)}
      />
    </a>
  );
}
