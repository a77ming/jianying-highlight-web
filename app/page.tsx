import FileUpload from "@/components/FileUpload";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* 头部 */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-3 text-slate-800">
            AI 高光剪辑工具
          </h1>
          <p className="text-base text-slate-600 max-w-xl mx-auto">
            上传字幕文件，AI 自动识别精彩片段并生成剪辑方案
          </p>
        </div>

        {/* 上传组件 */}
        <FileUpload />
      </div>
    </main>
  );
}
