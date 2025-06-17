import React from 'react'
import Sidebar from '../components/Sidebar'
import { Box } from '@mui/material'
import { Outlet } from 'react-router-dom'

const DashboardLayout: React.FC = () => (
  <Box display="flex" minHeight="100vh">
    <Sidebar />
    <Box flexGrow={1} p={3} bgcolor="#f4f6fa">
      <Outlet />
    </Box>
  </Box>
)

export default DashboardLayout 