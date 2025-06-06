'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { fetchTimetableByDate } from '@/api/getTimetable';
import { TimeTableItem } from '@/lib/types/timetable';

function getCurrentTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(
    now.getMinutes()
  ).padStart(2, '0')}`;
}

type StatusType = 'before' | 'during' | 'after';

function getCurrentStatusIndex(current: string, items: { time: string }[]): {
  status: StatusType;
  index: number | null;
} {
  const currentMinutes =
    parseInt(current.split(':')[0]) * 60 + parseInt(current.split(':')[1]);
  const startMinutes =
    parseInt(items[0].time.split(':')[0]) * 60 +
    parseInt(items[0].time.split(':')[1]);
  const endMinutes =
    parseInt(items[items.length - 1].time.split(':')[0]) * 60 +
    parseInt(items[items.length - 1].time.split(':')[1]);

  if (currentMinutes < startMinutes) return { status: 'before', index: null };
  if (currentMinutes > endMinutes) return { status: 'after', index: null };

  for (let i = 0; i < items.length - 1; i++) {
    const start =
      parseInt(items[i].time.split(':')[0]) * 60 +
      parseInt(items[i].time.split(':')[1]);
    const end =
      parseInt(items[i + 1].time.split(':')[0]) * 60 +
      parseInt(items[i + 1].time.split(':')[1]);

    if (currentMinutes >= start && currentMinutes < end) {
      return { status: 'during', index: i };
    }
  }

  return { status: 'during', index: items.length - 1 };
}

export default function CurrentTimeBlock({
  date,
  testTime,
}: {
  date: string;
  testTime?: string;
}) {
  const [nowTime, setNowTime] = useState(testTime ?? getCurrentTime());
  const [timetable, setTimetable] = useState<TimeTableItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!testTime) {
      const interval = setInterval(() => {
        setNowTime(getCurrentTime());
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [testTime]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchTimetableByDate(date);
        setTimetable(data);
      } catch (e) {
        console.error(e);
        setTimetable([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [date]);

  const { status, index } = timetable.length ? getCurrentStatusIndex(nowTime, timetable) : { status: 'before', index: null };
  const prev = index !== null ? timetable[index - 1] : null;
  const current = index !== null ? timetable[index] : null;
  const next = index !== null ? timetable[index + 1] : null;

  return (
    <section className="px-4 mt-10 space-y-4">
      <h2 className="flex items-center text-lg font-bold text-gray-800 gap-2">
        <Clock className="w-5 h-5 text-black-500" />
        지금 이 시간
      </h2>
  
      <div className="flex flex-col items-center gap-3">
        {loading ? (
          <div className="text-sm text-gray-400 italic">타임테이블 불러오는 중...</div>
        ) : timetable.length === 0 ? (
          <div className="text-sm text-gray-400 italic">해당 날짜에 일정이 없습니다.</div>
        ) : (
          <>
            {status === 'before' && (
              <div className="text-sm text-gray-400 italic">
                아직 축제가 시작되지 않았어요.
              </div>
            )}
  
            {status === 'after' && (
              <div className="text-sm text-gray-400 italic">
                오늘의 일정은 모두 종료되었습니다.
              </div>
            )}
  
            {status === 'during' && current && (
              <>
                {prev ? (
                  <div className="w-full max-w-md bg-gradient-to-r from-gray-100 to-white border-l-4 border-gray-300 p-3 rounded-xl text-gray-500 flex items-center justify-center gap-2 shadow-sm">
                    <span className="text-sm">이전: {prev.time} - {prev.title}</span>
                  </div>
                ) : (
                  <div className="text-sm text-gray-300 italic">이전 일정 없음</div>
                )}
  
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="w-full max-w-md relative bg-white border-2 border-blue-300 p-5 rounded-xl shadow-lg"
                >
                  <div className="absolute inset-0 bg-blue-200 opacity-20 rounded-xl z-0" />
                  <div className="relative z-10 text-center">
                    <div className="text-sm font-semibold text-black-100 tracking-wide">진행중</div>
                    <div className="text-lg font-bold text-black-900 mt-1">
                      {current.time} - {current.title}
                    </div>
                  </div>
                </motion.div>
  
                {next ? (
                  <div className="w-full max-w-md bg-gradient-to-r from-gray-100 to-white border-l-4 border-gray-300 p-3 rounded-xl text-gray-500 flex items-center justify-center gap-2 shadow-sm">
                    <span className="text-sm">다음: {next.time} - {next.title}</span>
                  </div>
                ) : (
                  <div className="text-sm text-gray-300 italic">다음 일정 없음</div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}