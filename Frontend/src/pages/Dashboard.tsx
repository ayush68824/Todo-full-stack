import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getTasks, createTask, updateTask } from '../utils/api'
import { CircularProgress, Box, Alert, Button, Snackbar, Grid, Typography, Paper } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import TaskForm from '../components/TaskForm'
import AddIcon from '@mui/icons-material/Add'
import type { Task } from '../utils/api'
import TaskCard from '../components/TaskCard'

const Dashboard: React.FC = () => {
  const { token, user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openTaskForm, setOpenTaskForm] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  })
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    fetchTasks()
  }, [token, navigate])

  const fetchTasks = async () => {
    if (!token) return
    setLoading(true)
    try {
      const data = await getTasks()
      setTasks(Array.isArray(data) ? data : [])
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to load tasks')
      setSnackbar({
        open: true,
        message: err.message || 'Failed to load tasks',
        severity: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = async (formData: FormData) => {
    try {
      await createTask(formData)
      await fetchTasks()
      setOpenTaskForm(false)
      setSnackbar({
        open: true,
        message: 'Task created successfully',
        severity: 'success'
      })
    } catch (error: any) {
      setError(error.message || 'Failed to create task')
      setSnackbar({
        open: true,
        message: error.message || 'Failed to create task',
        severity: 'error'
      })
    }
  }

  const handleEditTask = (task: Task) => {
    setSelectedTask(task)
    setOpenTaskForm(true)
  }

  const handleUpdateTask = async (formData: FormData) => {
    if (!token || !selectedTask) return
    try {
      await updateTask(selectedTask._id, formData)
      setOpenTaskForm(false)
      setSelectedTask(null)
      fetchTasks()
      setSnackbar({
        open: true,
        message: 'Task updated successfully',
        severity: 'success'
      })
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to update task',
        severity: 'error'
      })
    }
  }

  if (!user) return null

  return (
    <Box sx={{ p: 4, background: '#f8f6fa', minHeight: '100vh' }}>
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" fontWeight={700} color="#7b2ff2">Your Tasks</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedTask(null)
              setOpenTaskForm(true)
            }}
            sx={{ fontWeight: 600, fontSize: 16, px: 4, py: 1.5, borderRadius: 3 }}
          >
            Add Task
          </Button>
        </Box>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : tasks.length === 0 ? (
          <Typography variant="body1" textAlign="center" color="text.secondary">
            No tasks found
          </Typography>
        ) : (
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {tasks.map(task => (
              <Grid item xs={12} md={6} lg={4} key={task._id}>
                <TaskCard
                  task={task}
                  onEdit={() => handleEditTask(task)}
                  onDelete={() => {}}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      <TaskForm
        open={openTaskForm}
        onClose={() => {
          setOpenTaskForm(false);
          setSelectedTask(null);
        }}
        initialData={selectedTask || undefined}
        onSubmit={selectedTask ? handleUpdateTask : handleCreateTask}
        submitLabel={selectedTask ? 'Update' : 'Create'}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default Dashboard 