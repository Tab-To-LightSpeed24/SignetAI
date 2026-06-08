'use client'

import React from 'react'
import { Document, Page, pdfjs } from 'react-pdf'

// Required for text selection and custom highlighting
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'

// Detach the worker from Webpack entirely
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`

interface PdfViewerPaneProps {
  pdfFile: ArrayBuffer | null;
  totalPages: number;
  setTotalPages: (pages: number) => void;
  zoom: number;
  zoomIn: () => void;
  zoomOut: () => void;
}

const toolbarBtnStyle: React.CSSProperties = {
  padding: '4px 10px',
  background: '#222',
  border: '1px solid #444',
  borderRadius: 4,
  color: '#ccc',
  cursor: 'pointer',
  fontSize: 14,
  lineHeight: 1,
}

export default React.memo(function PdfViewerPane({
  pdfFile, totalPages, setTotalPages, zoom, zoomIn, zoomOut
}: PdfViewerPaneProps) {
  return (
    <>
      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px',
        borderBottom: '1px solid #333', background: '#0d0d1a',
      }}>
        <button onClick={zoomOut} style={toolbarBtnStyle} title="Zoom out">−</button>
        <span style={{ fontSize: 13, color: '#aaa', minWidth: 45, textAlign: 'center' }}>
          {Math.round(zoom * 100)}%
        </span>
        <button onClick={zoomIn} style={toolbarBtnStyle} title="Zoom in">+</button>
      </div>

      {/* Document Area */}
      <div 
        id="pdf-scroll-container"
        style={{
          flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: 20, background: '#0a0a14', gap: 20
        }}
      >
        {pdfFile ? (
          <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', transition: 'transform 0.15s ease' }}>
            <Document 
              file={pdfFile} 
              onLoadSuccess={({ numPages }) => setTotalPages(numPages)}
              loading={<p style={{ color: '#666', margin: 'auto' }}>Loading PDF...</p>}
            >
              {Array.from(new Array(totalPages), (el, index) => (
                <div key={`page_${index + 1}`} id={`pdf-page-${index + 1}`} style={{ boxShadow: '0 0 20px rgba(0,0,0,0.5)', marginBottom: 20 }}>
                  <Page
                    pageNumber={index + 1}
                    scale={1.0}
                    renderTextLayer={true}
                    renderAnnotationLayer={false}
                  />
                </div>
              ))}
            </Document>
          </div>
        ) : (
          <p style={{ color: '#666', margin: 'auto' }}>Waiting for PDF...</p>
        )}
      </div>
    </>
  )
})
