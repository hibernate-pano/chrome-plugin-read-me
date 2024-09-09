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
}

// 提取主要内容
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
      if (tagName === 'img') {
        const img = node.cloneNode(false);
        img.src = node.src; // 确保使用绝对路径
        filteredContent.appendChild(img);
      } else if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote'].includes(tagName)) {
        const newElement = document.createElement(tagName);
        Array.from(node.childNodes).forEach(child => filterContent(child));
        if (newElement.innerHTML.trim() !== '') {
          filteredContent.appendChild(newElement);
        }
      } else if (['div', 'section', 'article'].includes(tagName)) {
        const wrapper = document.createElement('div');
        Array.from(node.childNodes).forEach(child => filterContent(child));
        if (wrapper.innerHTML.trim() !== '') {
          filteredContent.appendChild(wrapper);
        }
      }
    }
  }
  
  Array.from(mainContent.childNodes).forEach(node => filterContent(node));
  
  // 移除连续的空白段落
  const paragraphs = filteredContent.querySelectorAll('p');
  paragraphs.forEach(p => {
    if (p.innerHTML.trim() === '') {
      p.remove();
    }
  });
  
  console.log('Filtered content:', filteredContent.innerHTML.substring(0, 100) + '...');
  return filteredContent.innerHTML;
}

// 创建控制面板
function createControlPanel(overlay) {
  const panel = document.createElement('div');
  panel.id = 'reader-mode-panel';
  panel.innerHTML = `
    <button id="close-reader-mode">关闭</button>
    <button id="change-bg-color">切换背景</button>
    <button id="change-font">切换字体</button>
    <button id="change-line-height">调整行高</button>
    <button id="change-width">调整宽度</button>
  `;
  overlay.appendChild(panel);
  
  // 添加事件监听器
  document.getElementById('close-reader-mode').addEventListener('click', toggleReaderMode);
  document.getElementById('change-bg-color').addEventListener('click', changeBgColor);
  document.getElementById('change-font').addEventListener('click', changeFont);
  document.getElementById('change-line-height').addEventListener('click', changeLineHeight);
  document.getElementById('change-width').addEventListener('click', changeWidth);
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
function changeBgColor() {
  document.querySelector('.reader-mode-overlay').classList.toggle('dark-mode');
}

function changeFont() {
  document.querySelector('.reader-mode-overlay').classList.toggle('serif-font');
}

function changeLineHeight() {
  document.querySelector('.reader-mode-overlay').classList.toggle('large-line-height');
}

function changeWidth() {
  document.querySelector('.reader-mode-overlay').classList.toggle('narrow-width');
}