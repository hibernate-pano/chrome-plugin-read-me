// 创建浮动图标
function createFloatingIcon() {
  const icon = document.createElement('div');
  icon.id = 'reader-mode-icon';
  icon.innerHTML = '📖';
  icon.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    font-size: 24px;
    cursor: pointer;
    z-index: 9999;
  `;
  document.body.appendChild(icon);
  icon.addEventListener('click', toggleReaderMode);
}

// 切换阅读模式
function toggleReaderMode() {
  console.log('Toggle reader mode called');
  const body = document.body;
  body.classList.toggle('reader-mode');
  console.log('Reader mode class toggled:', body.classList.contains('reader-mode'));
  if (body.classList.contains('reader-mode')) {
    createReaderModeContent();
    createControlPanel();
  } else {
    removeReaderModeContent();
    removeControlPanel();
  }
}

// 创建阅读模式内容
function createReaderModeContent() {
  const overlay = document.createElement('div');
  overlay.className = 'reader-mode-overlay';
  
  const content = document.createElement('div');
  content.id = 'reader-mode-content';
  content.innerHTML = `
    <div id="reader-mode-header">
      <h1>${document.title}</h1>
    </div>
    <div id="reader-mode-body">
      ${extractMainContent()}
    </div>
  `;
  
  overlay.appendChild(content);
  document.body.appendChild(overlay);

  // 在这里创建控制面板，确保它被添加到 overlay 中
  createControlPanel(overlay);

  // 设置懒加载
  setupLazyLoading();
}

// 修改 extractMainContent 函数
function extractMainContent() {
  console.log('Extracting main content');
  const selectors = [
    'article', 'main', '.main-content', '#main-content',
    '[role="main"]', '.post-content', '.entry-content',
    '.content', '#content'
  ];
  
  let mainContent = null;
  for (let selector of selectors) {
    mainContent = document.querySelector(selector);
    if (mainContent) break;
  }
  
  if (!mainContent) {
    mainContent = document.body;
  }
  
  const filteredContent = document.createElement('div');
  
  function filterContent(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const trimmedText = node.textContent.trim();
      if (trimmedText) {
        filteredContent.appendChild(document.createTextNode(trimmedText));
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const tagName = node.tagName.toLowerCase();
      const allowedTags = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'strong', 'em', 'u', 'b', 'i', 'a', 'img', 'pre', 'code', 'table', 'tr', 'td', 'th', 'thead', 'tbody'];
      
      if (allowedTags.includes(tagName)) {
        const newElement = document.createElement(tagName);
        
        // 复制属性
        Array.from(node.attributes).forEach(attr => {
          newElement.setAttribute(attr.name, attr.value);
        });
        
        // 特殊处理图片
        if (tagName === 'img') {
          newElement.src = node.src;
          newElement.alt = node.alt;
          newElement.className = 'reader-mode-image';
        }
        
        // 递归处理子元素
        Array.from(node.childNodes).forEach(child => filterContent(child));
        
        if (newElement.innerHTML.trim() !== '' || tagName === 'img') {
          filteredContent.appendChild(newElement);
        }
      } else if (['div', 'section', 'article'].includes(tagName)) {
        // 对于容器元素，我们直接处理其子元素
        Array.from(node.childNodes).forEach(child => filterContent(child));
      }
    }
  }
  
  Array.from(mainContent.childNodes).forEach(node => filterContent(node));
  
  console.log('Filtered content:', filteredContent.innerHTML.substring(0, 100) + '...');
  return filteredContent.innerHTML;
}

// 创建控制面板
function createControlPanel(overlay) {
  const panel = document.createElement('div');
  panel.id = 'reader-mode-panel';
  panel.innerHTML = `
    <button id="close-reader-mode">关闭</button>
    <div>
      <label>背景颜色:</label>
      <div id="bg-color-options">
        <button class="bg-color-option" data-color="#f8f8f8" style="background-color: #f8f8f8;"></button>
        <button class="bg-color-option" data-color="#f4ecd8" style="background-color: #f4ecd8;"></button>
        <button class="bg-color-option" data-color="#e5e9e7" style="background-color: #e5e9e7;"></button>
        <button class="bg-color-option" data-color="#d5e1e6" style="background-color: #d5e1e6;"></button>
        <button class="bg-color-option" data-color="#333333" style="background-color: #333333;"></button>
      </div>
    </div>
    <div>
      <label>字体:</label>
      <select id="font-selector">
        <option value="default">默认字体</option>
        <option value="songti">宋体</option>
        <option value="kaiti">楷体</option>
        <option value="heiti">黑体</option>
      </select>
    </div>
    <div>
      <label for="font-size-slider">字体大小: <span id="font-size-value">18</span>px</label>
      <input type="range" id="font-size-slider" min="8" max="30" step="1" value="18">
    </div>
    <div>
      <label for="line-height-slider">行高: <span id="line-height-value">1</span></label>
      <input type="range" id="line-height-slider" min="0.5" max="2" step="0.1" value="1">
    </div>
    <div>
      <label for="width-slider">宽度: <span id="width-value">800</span>px</label>
      <input type="range" id="width-slider" min="600" max="1200" step="50" value="800">
    </div>
  `;
  overlay.appendChild(panel);
  
  // 添加事件监听器
  document.getElementById('close-reader-mode').addEventListener('click', toggleReaderMode);
  document.getElementById('font-selector').addEventListener('change', changeFont);
  document.getElementById('font-size-slider').addEventListener('input', changeFontSize);
  document.getElementById('line-height-slider').addEventListener('input', changeLineHeight);
  document.getElementById('width-slider').addEventListener('input', changeWidth);
  
  // 为背景颜色选项添加事件监听器
  const bgColorOptions = document.querySelectorAll('.bg-color-option');
  bgColorOptions.forEach(option => {
    option.addEventListener('click', changeBgColor);
  });
}

// 移除阅读模式内容
function removeReaderModeContent() {
  const overlay = document.querySelector('.reader-mode-overlay');
  if (overlay) overlay.remove();
}

// 移除控制面板
function removeControlPanel() {
  const panel = document.getElementById('reader-mode-panel');
  if (panel) panel.remove();
}

// 初始化
console.log('Content script loaded');
createFloatingIcon();
console.log('Floating icon created');

// 添加这个函数来检查样式是否正确加载
function checkStyles() {
  const styles = window.getComputedStyle(document.body);
  console.log('Body background color:', styles.backgroundColor);
  console.log('Body color:', styles.color);
}

// 在页面加载完成后执行样式检查
window.addEventListener('load', checkStyles);

// 以下函数需要在reader.css中实现相应的样式类
function changeBgColor(event) {
  const color = event.target.dataset.color;
  const overlay = document.querySelector('.reader-mode-overlay');
  overlay.style.backgroundColor = color;
  
  // 根据背景颜色调整文本颜色
  const textColor = color === '#333333' ? '#f8f8f8' : '#333333';
  overlay.style.color = textColor;
  
  // 更新控制面板的背景色
  const panel = document.getElementById('reader-mode-panel');
  panel.style.backgroundColor = color === '#333333' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.8)';
}

function changeFont(event) {
  const overlay = document.querySelector('.reader-mode-overlay');
  const selectedFont = event.target.value;
  
  overlay.classList.remove('songti', 'kaiti', 'heiti');
  if (selectedFont !== 'default') {
    overlay.classList.add(selectedFont);
  }
}

function changeFontSize(event) {
  const readerModeBody = document.getElementById('reader-mode-body');
  const fontSizeValue = document.getElementById('font-size-value');
  const newFontSize = event.target.value;
  
  readerModeBody.style.fontSize = `${newFontSize}px`;
  fontSizeValue.textContent = newFontSize;
}

function changeLineHeight(event) {
  const overlay = document.querySelector('.reader-mode-overlay');
  const lineHeightValue = document.getElementById('line-height-value');
  const newLineHeight = event.target.value;
  
  overlay.style.lineHeight = newLineHeight;
  lineHeightValue.textContent = newLineHeight;
}

function changeWidth(event) {
  const content = document.getElementById('reader-mode-content');
  const widthValue = document.getElementById('width-value');
  const newWidth = event.target.value;
  
  content.style.maxWidth = `${newWidth}px`;
  widthValue.textContent = newWidth;
}

// 修改 setupLazyLoading 函数
function setupLazyLoading() {
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (!img.src && img.dataset.src) {
          img.src = img.dataset.src;
        }
        observer.unobserve(img);
      }
    });
  });

  document.querySelectorAll('.reader-mode-image').forEach(img => {
    observer.observe(img);
  });
}