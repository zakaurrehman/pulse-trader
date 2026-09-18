import type { Course, Video } from "@/app/generated/prisma/client";

export type CourseWithVideos = Course & { videos: Video[] };

export interface CourseAccessDb {
  enrollment: {
    findUnique(args: unknown): Promise<{ id: string } | null>;
  };
  course: {
    findUnique(args: unknown): Promise<CourseWithVideos | null>;
  };
}

/**
 * Access is granted at the course level (one Enrollment row per
 * student+course) — there is no per-lesson access record. Once enrolled,
 * ALL videos currently attached to that course are returned; there is
 * intentionally no `take`/limit/pagination here, since a course's lesson
 * count can grow after a student enrolls and they must see the current
 * full set on every visit.
 */
export async function getEnrolledCourseWithVideos(
  db: CourseAccessDb,
  studentId: string,
  courseId: string
): Promise<{ enrolled: boolean; course: CourseWithVideos | null }> {
  const enrollment = await db.enrollment.findUnique({
    where: { studentId_courseId: { studentId, courseId } },
  });
  if (!enrollment) return { enrolled: false, course: null };

  const course = await db.course.findUnique({
    where: { id: courseId },
    include: { videos: { orderBy: { sortOrder: "asc" } } },
  });
  return { enrolled: true, course };
}
