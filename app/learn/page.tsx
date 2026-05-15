import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function LearnPage() {
  const session = await getServerSession(authOptions);
  const studentId = session!.user.id;

  const enrollments = await prisma.enrollment.findMany({
    where: { studentId },
    include: {
      course: {
        include: { _count: { select: { videos: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900">My Courses</h1>
        <p className="text-slate-500 mt-1">Continue learning from where you left off.</p>
      </div>

      {enrollments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="text-5xl mb-4">🎓</div>
          <h2 className="text-xl font-black text-slate-900 mb-2">No courses yet</h2>
          <p className="text-slate-500 mb-6">
            Enroll in a course, complete payment, and it will appear here once confirmed.
          </p>
          <Link
            href="/order"
            className="inline-block bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-6 py-3 rounded-xl transition-colors"
          >
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {enrollments.map(({ course, createdAt }) => (
            <Link
              key={course.id}
              href={`/learn/${course.id}`}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:border-amber-400 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-2xl">
                  🎬
                </div>
                <span className="text-xs bg-green-100 text-green-700 font-bold px-2.5 py-1 rounded-full">
                  Enrolled
                </span>
              </div>
              <h3 className="font-black text-slate-900 text-lg mb-1 group-hover:text-amber-600 transition-colors">
                {course.name}
              </h3>
              {course.description && (
                <p className="text-slate-500 text-sm mb-3 line-clamp-2">{course.description}</p>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">
                  {course._count.videos} lesson{course._count.videos !== 1 ? "s" : ""}
                </span>
                <span className="text-amber-600 font-semibold group-hover:underline">
                  Start watching →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
