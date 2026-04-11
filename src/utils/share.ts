import html2canvas from 'html2canvas-pro'

/**
 * Capture a DOM element as a PNG image.
 * Tries navigator.share() first (mobile), falls back to download.
 */
export async function captureAndDownload(
  element: HTMLElement,
  filename: string = 'dark-cuisine-result.png',
) {
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#FFF8F0',
      scale: 2,
      useCORS: true,
      logging: false,
      onclone: (doc) => {
        // Copy canvas content in cloned document
        const origCanvases = element.querySelectorAll('canvas')
        const clonedCanvases = doc.querySelectorAll('canvas')
        origCanvases.forEach((orig, i) => {
          const cloned = clonedCanvases[i]
          if (cloned) {
            const ctx = cloned.getContext('2d')
            if (ctx) {
              cloned.width = orig.width
              cloned.height = orig.height
              ctx.drawImage(orig, 0, 0)
            }
          }
        })
      },
    })

    // Try Web Share API first (mobile browsers)
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/png')
    )

    if (blob && navigator.share) {
      const file = new File([blob], filename, { type: 'image/png' })
      const shareData = {
        title: '🍳 黑暗料理模拟器',
        text: '看看我做了什么黑暗料理！来试试吧！',
        files: [file],
      }

      if (navigator.canShare?.(shareData)) {
        await navigator.share(shareData)
        return
      }
    }

    // Fallback: download
    const link = document.createElement('a')
    link.download = filename
    link.href = canvas.toDataURL('image/png')
    link.click()
  } catch (err) {
    // User cancelled share is not an error
    if (err instanceof Error && err.name === 'AbortError') return
    console.error('Share capture failed:', err)
    alert('截图失败，请稍后重试')
  }
}
