import { useEffect } from 'react';

export default function PrintManager({
  html,
  onComplete
}) {

  useEffect(() => {

    if (!html) return;

    const win = window.open(
      '',
      '',
      'width=320,height=600'
    );

    win.document.write(`
      <html>
      <body>
        ${html}
      </body>
      </html>
    `);

    win.document.close();

    setTimeout(() => {

      win.print();

      setTimeout(() => {

        win.close();

        onComplete?.();

      }, 1500);

    }, 300);

  }, [html]);

  return null;
}