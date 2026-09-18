import { describe, it, expect, vi } from "vitest";
import { getEnrolledCourseWithVideos, type CourseAccessDb } from "./courseAccess";

function makeVideos(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `video_${i + 1}`,
    courseId: "course_1",
    title: `Lesson ${i + 1}`,
    sortOrder: i,
  }));
}

describe("getEnrolledCourseWithVideos", () => {
  it("returns every video attached to the course — no accidental limit/pagination", async () => {
    const videos = makeVideos(7);
    const db: CourseAccessDb = {
      enrollment: {
        findUnique: vi.fn().mockResolvedValue({ id: "enr_1" }),
      },
      course: {
        findUnique: vi.fn().mockResolvedValue({ id: "course_1", name: "Advanced Trading Strategies", videos } as any),
      },
    };

    const result = await getEnrolledCourseWithVideos(db, "student_1", "course_1");

    expect(result.enrolled).toBe(true);
    expect(result.course?.videos).toHaveLength(7);
    expect(result.course?.videos.map((v) => v.id)).toEqual([
      "video_1", "video_2", "video_3", "video_4", "video_5", "video_6", "video_7",
    ]);
  });

  it("reflects newly-uploaded videos on every call — a student who first enrolled when only 1 video existed sees all 7 once the rest are uploaded", async () => {
    const db: CourseAccessDb = {
      enrollment: { findUnique: vi.fn().mockResolvedValue({ id: "enr_1" }) },
      course: { findUnique: vi.fn() },
    };

    (db.course.findUnique as any).mockResolvedValueOnce({ id: "course_1", videos: makeVideos(1) });
    const first = await getEnrolledCourseWithVideos(db, "student_1", "course_1");
    expect(first.course?.videos).toHaveLength(1);

    (db.course.findUnique as any).mockResolvedValueOnce({ id: "course_1", videos: makeVideos(7) });
    const second = await getEnrolledCourseWithVideos(db, "student_1", "course_1");
    expect(second.course?.videos).toHaveLength(7);
  });

  it("denies access and never fetches course/video data for a student without an enrollment", async () => {
    const db: CourseAccessDb = {
      enrollment: { findUnique: vi.fn().mockResolvedValue(null) },
      course: { findUnique: vi.fn() },
    };

    const result = await getEnrolledCourseWithVideos(db, "student_1", "course_1");

    expect(result.enrolled).toBe(false);
    expect(result.course).toBeNull();
    expect(db.course.findUnique).not.toHaveBeenCalled();
  });
});
