/**
 * Project Test Fixtures
 */

export const validProject = {
  name: 'Website Redesign',
  description: 'Complete website redesign and development',
  status: 'active',
  start_date: '2024-01-01',
  end_date: '2024-03-31',
  budget: 50000.00,
  hourly_rate: 150.00,
};

export const validProject2 = {
  name: 'Mobile App Development',
  description: 'iOS and Android app development',
  status: 'active',
  start_date: '2024-02-01',
  budget: 75000.00,
};

export const completedProject = {
  name: 'Completed Project',
  status: 'completed',
  start_date: '2023-01-01',
  end_date: '2023-12-31',
  budget: 30000.00,
};

export const onHoldProject = {
  name: 'On Hold Project',
  status: 'on_hold',
  start_date: '2024-01-01',
};

export const invalidProjects = {
  emptyName: {
    name: '',
    status: 'active',
  },
  invalidStatus: {
    name: 'Test Project',
    status: 'invalid',
  },
  endBeforeStart: {
    name: 'Test Project',
    status: 'active',
    start_date: '2024-03-31',
    end_date: '2024-01-01',
  },
};