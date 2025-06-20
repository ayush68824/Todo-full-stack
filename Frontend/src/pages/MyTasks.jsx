import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { getTasks, deleteTask } from '../utils/api.js';
import { Box, Typography, Grid, CircularProgress, Alert, TextField, MenuItem, Select, InputLabel, FormControl, Paper } from '@mui/material';
import TaskCard from '../components/TaskCard.jsx';

const priorityOrder = { High: 1, Moderate: 2, Low: 3 };

const MyTasks = () => {
  const { token, user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('');

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line
  }, [token]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await getTasks();
      setTasks(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
      await fetchTasks();
    } catch (err) {
      setError(err.message || 'Failed to delete task');
    }
  };

  const filteredTasks = tasks
    .filter(task =>
      (!search || task.title.toLowerCase().includes(search.toLowerCase())) &&
      (!priority || task.priority === priority)
    )
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  if (!user) return null;

  return (
    <Box sx={{ p: 4, background: '#f8f6fa', minHeight: '100vh' }}>
      <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        <Typography variant="h6" fontWeight={700} color="#7b2ff2" mb={2}>My Tasks</Typography>
        <Box display="flex" gap={2} mb={2}>
          <TextField
            label="Search by name"
            value={search}
            onChange={e => setSearch(e.target.value)}
            size="small"
            sx={{ width: 250 }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={priority}
              label="Priority"
              onChange={e => setPriority(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="High">High</MenuItem>
              <MenuItem value="Moderate">Moderate</MenuItem>
              <MenuItem value="Low">Low</MenuItem>
            </Select>
          </FormControl>
        </Box>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : filteredTasks.length === 0 ? (
          <Typography variant="body1" textAlign="center" color="text.secondary">
            No tasks found
          </Typography>
        ) : (
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {filteredTasks.map(task => (
              <Grid item xs={12} md={6} lg={4} key={task._id}>
                <TaskCard
                  task={task}
                  onEdit={() => {}}
                  onDelete={() => handleDeleteTask(task._id)}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Box>
  );
};

export default MyTasks; 