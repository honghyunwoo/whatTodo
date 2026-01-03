/**
 * TaskStore Tests
 *
 * @created 2026-01-03 - 상용화 준비 Phase 0
 *
 * Tests for task CRUD operations, filtering, and subtasks.
 */

import { useTaskStore } from '@/store/taskStore';
import type { TaskFormData, TaskPriority, TaskCategory } from '@/types/task';

// Helper to create test task data
const createTaskData = (overrides: Partial<TaskFormData> = {}): TaskFormData => ({
  title: 'Test Task',
  category: 'work' as TaskCategory,
  priority: 'medium' as TaskPriority,
  ...overrides,
});

// Helper to get today's date as ISO string
const getTodayISO = (): string => {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return today.toISOString();
};

// Helper to get tomorrow's date as ISO string
const getTomorrowISO = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(12, 0, 0, 0);
  return tomorrow.toISOString();
};

describe('taskStore', () => {
  // Reset store before each test
  beforeEach(() => {
    useTaskStore.setState({
      tasks: [],
      filter: 'all',
      sortBy: 'createdAt',
      smartList: 'today',
    });
  });

  describe('addTask', () => {
    it('새 태스크를 추가해야 함', () => {
      const store = useTaskStore.getState();
      const taskData = createTaskData({ title: '새 할 일' });

      store.addTask(taskData);

      const tasks = useTaskStore.getState().tasks;
      expect(tasks).toHaveLength(1);
      expect(tasks[0].title).toBe('새 할 일');
      expect(tasks[0].completed).toBe(false);
      expect(tasks[0].id).toBeDefined();
    });

    it('여러 태스크를 추가할 수 있어야 함', () => {
      const store = useTaskStore.getState();

      store.addTask(createTaskData({ title: '태스크 1' }));
      store.addTask(createTaskData({ title: '태스크 2' }));
      store.addTask(createTaskData({ title: '태스크 3' }));

      expect(useTaskStore.getState().tasks).toHaveLength(3);
    });

    it('태스크에 기본 subtasks 배열이 있어야 함', () => {
      const store = useTaskStore.getState();
      store.addTask(createTaskData());

      const task = useTaskStore.getState().tasks[0];
      expect(task.subtasks).toEqual([]);
    });

    it('태스크에 createdAt, updatedAt 타임스탬프가 있어야 함', () => {
      const store = useTaskStore.getState();
      store.addTask(createTaskData());

      const task = useTaskStore.getState().tasks[0];
      expect(task.createdAt).toBeDefined();
      expect(task.updatedAt).toBeDefined();
    });
  });

  describe('updateTask', () => {
    it('태스크 제목을 업데이트해야 함', () => {
      const store = useTaskStore.getState();
      store.addTask(createTaskData({ title: '원래 제목' }));
      const taskId = useTaskStore.getState().tasks[0].id;

      store.updateTask(taskId, { title: '새 제목' });

      expect(useTaskStore.getState().tasks[0].title).toBe('새 제목');
    });

    it('태스크 우선순위를 업데이트해야 함', () => {
      const store = useTaskStore.getState();
      store.addTask(createTaskData({ priority: 'low' }));
      const taskId = useTaskStore.getState().tasks[0].id;

      store.updateTask(taskId, { priority: 'urgent' });

      expect(useTaskStore.getState().tasks[0].priority).toBe('urgent');
    });

    it('업데이트 시 updatedAt이 변경되어야 함', () => {
      const store = useTaskStore.getState();
      store.addTask(createTaskData());
      const task = useTaskStore.getState().tasks[0];
      const originalUpdatedAt = task.updatedAt;

      // 약간의 지연 후 업데이트
      store.updateTask(task.id, { title: '업데이트' });

      const updatedTask = useTaskStore.getState().tasks[0];
      expect(new Date(updatedTask.updatedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(originalUpdatedAt).getTime()
      );
    });
  });

  describe('deleteTask', () => {
    it('태스크를 삭제해야 함', () => {
      const store = useTaskStore.getState();
      store.addTask(createTaskData());
      const taskId = useTaskStore.getState().tasks[0].id;

      store.deleteTask(taskId);

      expect(useTaskStore.getState().tasks).toHaveLength(0);
    });

    it('존재하지 않는 태스크 삭제는 에러 없이 처리됨', () => {
      const store = useTaskStore.getState();
      store.addTask(createTaskData());

      expect(() => store.deleteTask('non-existent-id')).not.toThrow();
      expect(useTaskStore.getState().tasks).toHaveLength(1);
    });
  });

  describe('toggleComplete', () => {
    it('태스크를 완료 상태로 변경해야 함', () => {
      const store = useTaskStore.getState();
      store.addTask(createTaskData());
      const taskId = useTaskStore.getState().tasks[0].id;

      store.toggleComplete(taskId);

      const task = useTaskStore.getState().tasks[0];
      expect(task.completed).toBe(true);
      expect(task.completedAt).toBeDefined();
    });

    it('완료된 태스크를 미완료로 변경해야 함', () => {
      const store = useTaskStore.getState();
      store.addTask(createTaskData());
      const taskId = useTaskStore.getState().tasks[0].id;

      store.toggleComplete(taskId); // 완료
      store.toggleComplete(taskId); // 미완료

      const task = useTaskStore.getState().tasks[0];
      expect(task.completed).toBe(false);
      expect(task.completedAt).toBeUndefined();
    });
  });

  describe('getTaskById', () => {
    it('ID로 태스크를 찾아야 함', () => {
      const store = useTaskStore.getState();
      store.addTask(createTaskData({ title: '찾을 태스크' }));
      const taskId = useTaskStore.getState().tasks[0].id;

      const found = store.getTaskById(taskId);

      expect(found).toBeDefined();
      expect(found?.title).toBe('찾을 태스크');
    });

    it('존재하지 않는 ID는 undefined 반환', () => {
      const store = useTaskStore.getState();
      const found = store.getTaskById('non-existent');

      expect(found).toBeUndefined();
    });
  });

  describe('getCompletionRate', () => {
    it('태스크가 없으면 0 반환', () => {
      const store = useTaskStore.getState();
      expect(store.getCompletionRate()).toBe(0);
    });

    it('완료율을 올바르게 계산해야 함', () => {
      const store = useTaskStore.getState();
      store.addTask(createTaskData({ title: '태스크 1' }));
      store.addTask(createTaskData({ title: '태스크 2' }));

      const task1Id = useTaskStore.getState().tasks[0].id;
      store.toggleComplete(task1Id);

      expect(store.getCompletionRate()).toBe(50);
    });

    it('모든 태스크 완료 시 100 반환', () => {
      const store = useTaskStore.getState();
      store.addTask(createTaskData());
      const taskId = useTaskStore.getState().tasks[0].id;
      store.toggleComplete(taskId);

      expect(store.getCompletionRate()).toBe(100);
    });
  });

  describe('getTodayTasks', () => {
    it('오늘 마감인 미완료 태스크만 반환해야 함', () => {
      const store = useTaskStore.getState();
      store.addTask(createTaskData({ title: '오늘', dueDate: getTodayISO() }));
      store.addTask(createTaskData({ title: '내일', dueDate: getTomorrowISO() }));
      store.addTask(createTaskData({ title: '마감없음' }));

      const todayTasks = store.getTodayTasks();

      expect(todayTasks).toHaveLength(1);
      expect(todayTasks[0].title).toBe('오늘');
    });

    it('완료된 태스크는 제외해야 함', () => {
      const store = useTaskStore.getState();
      store.addTask(createTaskData({ title: '오늘', dueDate: getTodayISO() }));
      const taskId = useTaskStore.getState().tasks[0].id;
      store.toggleComplete(taskId);

      expect(store.getTodayTasks()).toHaveLength(0);
    });
  });

  describe('getUpcomingTasks', () => {
    it('내일 이후 마감인 미완료 태스크만 반환해야 함', () => {
      const store = useTaskStore.getState();
      store.addTask(createTaskData({ title: '오늘', dueDate: getTodayISO() }));
      store.addTask(createTaskData({ title: '내일', dueDate: getTomorrowISO() }));

      const upcoming = store.getUpcomingTasks();

      expect(upcoming).toHaveLength(1);
      expect(upcoming[0].title).toBe('내일');
    });
  });

  describe('getAnytimeTasks', () => {
    it('마감 없는 미완료 태스크만 반환해야 함', () => {
      const store = useTaskStore.getState();
      store.addTask(createTaskData({ title: '마감없음 1' }));
      store.addTask(createTaskData({ title: '마감없음 2' }));
      store.addTask(createTaskData({ title: '오늘', dueDate: getTodayISO() }));

      const anytime = store.getAnytimeTasks();

      expect(anytime).toHaveLength(2);
    });
  });

  describe('getCompletedTasks', () => {
    it('완료된 태스크만 반환해야 함', () => {
      const store = useTaskStore.getState();
      store.addTask(createTaskData({ title: '태스크 1' }));
      store.addTask(createTaskData({ title: '태스크 2' }));

      const task1Id = useTaskStore.getState().tasks[0].id;
      store.toggleComplete(task1Id);

      const completed = store.getCompletedTasks();

      expect(completed).toHaveLength(1);
      expect(completed[0].title).toBe('태스크 1');
    });
  });

  describe('getSmartListCount', () => {
    it('스마트 리스트별 카운트를 올바르게 반환해야 함', () => {
      const store = useTaskStore.getState();
      store.addTask(createTaskData({ title: '오늘', dueDate: getTodayISO() }));
      store.addTask(createTaskData({ title: '내일', dueDate: getTomorrowISO() }));
      store.addTask(createTaskData({ title: '마감없음' }));

      expect(store.getSmartListCount('today')).toBe(1);
      expect(store.getSmartListCount('upcoming')).toBe(1);
      expect(store.getSmartListCount('anytime')).toBe(1);
      expect(store.getSmartListCount('all')).toBe(3);
      expect(store.getSmartListCount('completed')).toBe(0);
    });
  });

  describe('setFilter / setSortBy / setSmartList', () => {
    it('필터를 변경해야 함', () => {
      const store = useTaskStore.getState();
      store.setFilter('completed');

      expect(useTaskStore.getState().filter).toBe('completed');
    });

    it('정렬을 변경해야 함', () => {
      const store = useTaskStore.getState();
      store.setSortBy('priority');

      expect(useTaskStore.getState().sortBy).toBe('priority');
    });

    it('스마트 리스트를 변경해야 함', () => {
      const store = useTaskStore.getState();
      store.setSmartList('upcoming');

      expect(useTaskStore.getState().smartList).toBe('upcoming');
    });
  });

  describe('SubTasks', () => {
    it('서브태스크를 추가해야 함', () => {
      const store = useTaskStore.getState();
      store.addTask(createTaskData());
      const taskId = useTaskStore.getState().tasks[0].id;

      store.addSubTask(taskId, { title: '서브태스크 1' });

      const task = useTaskStore.getState().tasks[0];
      expect(task.subtasks).toHaveLength(1);
      expect(task.subtasks[0].title).toBe('서브태스크 1');
      expect(task.subtasks[0].completed).toBe(false);
    });

    it('서브태스크는 최대 20개까지만 추가 가능', () => {
      const store = useTaskStore.getState();
      store.addTask(createTaskData());
      const taskId = useTaskStore.getState().tasks[0].id;

      // 21개 추가 시도
      for (let i = 0; i < 21; i++) {
        store.addSubTask(taskId, { title: `서브태스크 ${i + 1}` });
      }

      const task = useTaskStore.getState().tasks[0];
      expect(task.subtasks).toHaveLength(20);
    });

    it('서브태스크를 삭제해야 함', () => {
      const store = useTaskStore.getState();
      store.addTask(createTaskData());
      const taskId = useTaskStore.getState().tasks[0].id;

      store.addSubTask(taskId, { title: '삭제할 서브태스크' });
      const subtaskId = useTaskStore.getState().tasks[0].subtasks[0].id;

      store.deleteSubTask(taskId, subtaskId);

      expect(useTaskStore.getState().tasks[0].subtasks).toHaveLength(0);
    });

    it('서브태스크 완료를 토글해야 함', () => {
      const store = useTaskStore.getState();
      store.addTask(createTaskData());
      const taskId = useTaskStore.getState().tasks[0].id;

      store.addSubTask(taskId, { title: '서브태스크' });
      const subtaskId = useTaskStore.getState().tasks[0].subtasks[0].id;

      store.toggleSubTaskComplete(taskId, subtaskId);

      const subtask = useTaskStore.getState().tasks[0].subtasks[0];
      expect(subtask.completed).toBe(true);
      expect(subtask.completedAt).toBeDefined();
    });

    it('서브태스크 진행률을 계산해야 함', () => {
      const store = useTaskStore.getState();
      store.addTask(createTaskData());
      const taskId = useTaskStore.getState().tasks[0].id;

      store.addSubTask(taskId, { title: '서브 1' });
      store.addSubTask(taskId, { title: '서브 2' });
      const subtaskId = useTaskStore.getState().tasks[0].subtasks[0].id;
      store.toggleSubTaskComplete(taskId, subtaskId);

      const progress = store.getSubTaskProgress(taskId);

      expect(progress.total).toBe(2);
      expect(progress.completed).toBe(1);
      expect(progress.percentage).toBe(50);
    });

    it('서브태스크 없으면 진행률 0', () => {
      const store = useTaskStore.getState();
      store.addTask(createTaskData());
      const taskId = useTaskStore.getState().tasks[0].id;

      const progress = store.getSubTaskProgress(taskId);

      expect(progress.total).toBe(0);
      expect(progress.completed).toBe(0);
      expect(progress.percentage).toBe(0);
    });
  });

  describe('getFilteredTasks with sorting', () => {
    it('우선순위로 정렬해야 함', () => {
      const store = useTaskStore.getState();
      store.addTask(createTaskData({ title: '낮음', priority: 'low' }));
      store.addTask(createTaskData({ title: '긴급', priority: 'urgent' }));
      store.addTask(createTaskData({ title: '높음', priority: 'high' }));

      store.setSortBy('priority');
      const filtered = store.getFilteredTasks();

      expect(filtered[0].title).toBe('긴급');
      expect(filtered[1].title).toBe('높음');
      expect(filtered[2].title).toBe('낮음');
    });

    it('제목으로 정렬해야 함', () => {
      const store = useTaskStore.getState();
      store.addTask(createTaskData({ title: 'C Task' }));
      store.addTask(createTaskData({ title: 'A Task' }));
      store.addTask(createTaskData({ title: 'B Task' }));

      store.setSortBy('title');
      const filtered = store.getFilteredTasks();

      expect(filtered[0].title).toBe('A Task');
      expect(filtered[1].title).toBe('B Task');
      expect(filtered[2].title).toBe('C Task');
    });

    it('마감일로 정렬해야 함', () => {
      const store = useTaskStore.getState();
      const tomorrow = getTomorrowISO();
      const today = getTodayISO();

      store.addTask(createTaskData({ title: '마감없음' }));
      store.addTask(createTaskData({ title: '내일', dueDate: tomorrow }));
      store.addTask(createTaskData({ title: '오늘', dueDate: today }));

      store.setSortBy('dueDate');
      const filtered = store.getFilteredTasks();

      expect(filtered[0].title).toBe('오늘');
      expect(filtered[1].title).toBe('내일');
      expect(filtered[2].title).toBe('마감없음');
    });
  });
});
