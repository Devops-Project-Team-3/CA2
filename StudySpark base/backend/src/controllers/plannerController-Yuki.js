/*
  Owner: Yuki
  Feature: Study Planner CRUD
  Status: Implemented for Phase 1.
  Description: Backend planner controller using in-memory storage until a database is added.
*/

const plannerItems = [];

function getPlannerPlaceholder(req, res) {
  const query = String(req.query.q || '').trim().toLowerCase();
  const filteredPlannerItems = query
    ? plannerItems.filter((item) =>
        [item.title, item.subject, item.description, item.date]
          .some((value) => String(value || '').toLowerCase().includes(query))
      )
    : plannerItems;

  res.json({
    message: 'Study Planner sessions fetched successfully.',
    data: {
      plannerItems: filteredPlannerItems,
      query,
      totalResults: filteredPlannerItems.length
    }
  });
}

function createPlannerPlaceholder(req, res) {
  const { title, subject, description, date, completed, duration } = req.body || {};

  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({
      message: 'A study session title is required.'
    });
  }

  const parsedDuration = Number(duration);

  const newPlannerItem = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: title.trim(),
    subject: subject ? String(subject).trim() : 'General',
    description: description ? String(description).trim() : '',
    date: date ? String(date) : '',
    completed: Boolean(completed),
    duration: Number.isFinite(parsedDuration) && parsedDuration > 0 ? parsedDuration : 45,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  plannerItems.push(newPlannerItem);

  res.status(201).json({
    message: 'Study session created successfully.',
    data: { plannerItem: newPlannerItem }
  });
}

function updatePlannerPlaceholder(req, res) {
  const plannerItem = plannerItems.find((item) => item.id === req.params.id);
  if (!plannerItem) {
    return res.status(404).json({
      message: 'Study session not found.'
    });
  }

  const { title, subject, description, date, completed, duration } = req.body || {};

  if (title !== undefined) {
    plannerItem.title = String(title).trim() || plannerItem.title;
  }

  if (subject !== undefined) {
    plannerItem.subject = String(subject).trim() || 'General';
  }

  if (description !== undefined) {
    plannerItem.description = String(description).trim();
  }

  if (date !== undefined) {
    plannerItem.date = String(date);
  }

  if (completed !== undefined) {
    plannerItem.completed = Boolean(completed);
  }

  if (duration !== undefined) {
    const parsedDuration = Number(duration);
    plannerItem.duration = Number.isFinite(parsedDuration) && parsedDuration > 0 ? parsedDuration : plannerItem.duration;
  }

  plannerItem.updatedAt = new Date().toISOString();

  res.json({
    message: 'Study session updated successfully.',
    data: { plannerItem }
  });
}

function deletePlannerPlaceholder(req, res) {
  const index = plannerItems.findIndex((item) => item.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({
      message: 'Study session not found.'
    });
  }

  plannerItems.splice(index, 1);

  res.json({
    message: 'Study session deleted successfully.',
    data: { deleted: true, id: req.params.id }
  });
}

export {
  createPlannerPlaceholder,
  deletePlannerPlaceholder,
  getPlannerPlaceholder,
  updatePlannerPlaceholder
};
