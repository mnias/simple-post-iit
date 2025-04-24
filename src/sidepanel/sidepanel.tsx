// 처음에 이 파일에서 직접 DOM 조작이나 이벤트 리스너를 처리함
import React from 'react';
import { createRoot } from 'react-dom/client';
import '../styles/global.css';

const Sidepanel = () => {
  const [text, setText] = React.useState('');

  return (
    <div className="flex flex-col p-4 gap-4">
      <textarea
        className="bg-amber-200 p-8 rounded-lg focus:outline-none h-200 text-[16px] resize-none"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex flex-row gap-4">
        <button
          className="bg-blue-500 text-white p-2 rounded"
          draggable
          onDragStart={(e) => console.log('drag start')}
        >
          붙이기
        </button>
        <button className="bg-blue-500 text-white p-2 rounded" onClick={() => setText('')}>
          지우기
        </button>
      </div>
    </div>
  );
};

const container = document.getElementById('root');
const root = createRoot(container as HTMLDivElement);
root.render(<Sidepanel />);
