"use client";
import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';

const defaultImage = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23222'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%23666'%3ENo Image%3C/text%3E%3C/svg%3E";

const generateInitialItems = (count, prefix, title) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `${prefix}-${i + 1}`,
    name: `${title} ${i + 1}`,
    price: 'RM 10',
    img: defaultImage
  }));
};

export default function Home() {
  const [status, setStatus] = useState('open');
  const [bgColor, setBgColor] = useState('#111115');
  const [foods, setFoods] = useState(generateInitialItems(6, 'f', 'Food'));
  const [sides, setSides] = useState(generateInitialItems(4, 's', 'Side Dish'));
  const [drinks, setDrinks] = useState(generateInitialItems(1, 'd', 'Drink'));
  const [isExporting, setIsExporting] = useState(false);
  
  const canvasRef = useRef(null);

  const handleItemChange = (setState, index, field, value) => {
    setState(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleImageChange = (setState, index, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleItemChange(setState, index, 'img', e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const exportAsPNG = async () => {
    if (!canvasRef.current) return;
    setIsExporting(true);
    setTimeout(async () => {
      try {
        const canvas = await html2canvas(canvasRef.current, {
          useCORS: true,
          scale: 2,
          backgroundColor: bgColor
        });
        const link = document.createElement('a');
        link.download = 'menu-post.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (err) {
        console.error('Failed to export', err);
      }
      setIsExporting(false);
    }, 100);
  };

  const renderEditors = (items, setState, title) => (
    <>
      <div className="section-title">{items.length} {title}</div>
      {items.map((item, index) => (
        <div key={item.id} className="item-editor">
          <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '5px', fontWeight: '800' }}>
            {title.toUpperCase()} {index + 1}
          </div>
          <input
            type="text"
            placeholder="Item Name"
            value={item.name}
            onChange={(e) => handleItemChange(setState, index, 'name', e.target.value)}
          />
          <input
            type="text"
            placeholder="Price"
            value={item.price}
            onChange={(e) => handleItemChange(setState, index, 'price', e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageChange(setState, index, e.target.files[0])}
          />
        </div>
      ))}
    </>
  );

  const renderPreviews = (items) => (
    items.map(item => (
      <div key={item.id} className="menu-item">
        <img src={item.img} alt={item.name} />
        <div className="menu-item-info">
          <div className="menu-item-name">{item.name}</div>
          <div className="menu-item-price">{item.price}</div>
        </div>
      </div>
    ))
  );

  return (
    <div className="app-container">
      <aside className="editor-panel">
        <h1>Menu Generator</h1>
        <div className="controls">
          <label>
            Stall Status
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </label>
          
          <label>
            Canvas Background
            <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
          </label>

          {renderEditors(foods, setFoods, 'Foods')}
          {renderEditors(sides, setSides, 'Side Dishes')}
          {renderEditors(drinks, setDrinks, 'Drinks')}

          <button onClick={exportAsPNG} className="btn-primary" disabled={isExporting}>
            {isExporting ? 'Generating...' : 'Save as PNG'}
          </button>
        </div>
      </aside>

      <main className="preview-panel">
        <div 
          ref={canvasRef} 
          className={`canvas-area ${status}-status`} 
          style={{ backgroundColor: bgColor }}
        >
          <div className="status-banner">
            {status === 'open' ? 'WE ARE OPEN' : 'WE ARE CLOSED'}
          </div>
          <div className="menu-content">
            <div className="menu-section">
              <h2>MAIN COURSE</h2>
              <div className="items-grid food-grid">
                {renderPreviews(foods)}
              </div>
            </div>
            <div className="menu-section">
              <h2>SIDES & DRINK</h2>
              <div className="items-grid side-drink-grid">
                {renderPreviews(sides)}
                {renderPreviews(drinks)}
              </div>
            </div>
          </div>
          <div className="social-footer">
            <div className="cta">
              <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WA" crossOrigin="anonymous" /> 
              WhatsApp: +1234567890
            </div>
            <div className="cta">
              <img src="https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg" alt="TikTok" crossOrigin="anonymous" /> 
              @yourfoodstall
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
