import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import VideoPlayer from "@/components/VideoPlayer";

export default async function CoursePlayerPage({
  params,
  searchParams,
}: {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ v?: string }>;
}) {
  const { courseId } = await params;
  const { v: activeVideoId } = await searchParams;
  const session = await getServerSession(authOptions);
  const studentId = session!.user.id;

  // Verify student is enrolled
  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_courseId: { studentId, courseId } },
  });
  if (!enrollment) redirect("/learn");

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { videos: { orderBy: { sortOrder: "asc" } } },
  });
  if (!course) redirect("/learn");

  const activeVideo = course.videos.find((v) => v.id === activeVideoId) ?? course.videos[0] ?? null;

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="bg-slate-900 px-5 py-3 flex items-center gap-4 flex-shrink-0">
        <Link href="/learn" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">
          ← My Courses
        </Link>
        <span className="text-slate-600">/</span>
        <span className="text-white font-bold text-sm truncate">{course.name}</span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Video area */}
        <div className="flex-1 overflow-auto bg-black flex flex-col">
          {activeVideo ? (
            <>
              <VideoPlayer url={activeVideo.blobUrl} />
              <div className="bg-slate-900 px-6 py-4">
                <h2 className="text-white font-bold text-lg">{activeVideo.title}</h2>
                {activeVideo.description && (
                  <p className="text-slate-400 text-sm mt-1">{activeVideo.description}</p>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-slate-400">
                <div className="text-5xl mb-3">📹</div>
                <p className="font-semibold">No videos uploaded yet.</p>
                <p className="text-sm mt-1">Check back soon!</p>
              </div>
            </div>
          )}
        </div>

        {/* Lesson list sidebar */}
        <div className="w-72 bg-slate-900 border-l border-slate-800 flex flex-col flex-shrink-0 hidden md:flex">
          <div className="px-4 py-3 border-b border-slate-800">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
              Course Content · {course.videos.length} Lesson{course.videos.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex-1 overflow-auto">
            {course.videos.length === 0 ? (
              <p className="text-slate-500 text-sm p-4">No lessons yet.</p>
            ) : (
              course.videos.map((v, i) => {
                const isActive = v.id === (activeVideo?.id ?? "");
                return (
                  <Link
                    key={v.id}
                    href={`/learn/${courseId}?v=${v.id}`}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-slate-800/50 transition-colors ${
                      isActive ? "bg-amber-500/10 border-l-2 border-l-amber-500" : "hover:bg-slate-800"
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                      isActive ? "bg-amber-500 text-slate-900" : "bg-slate-700 text-slate-300"
                    }`}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${isActive ? "text-amber-400" : "text-slate-300"}`}>
                        {v.title}
                      </p>
                      {v.description && (
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{v.description}</p>
                      )}
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
