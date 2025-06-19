import React from 'react'
import { Drawer, Box, Avatar, Typography, List, ListItem, ListItemIcon, ListItemText, Divider, Button, useTheme, useMediaQuery, ListItemButton } from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import ListAltIcon from '@mui/icons-material/ListAlt'
import SettingsIcon from '@mui/icons-material/Settings'
import LogoutIcon from '@mui/icons-material/Logout'
import { useAuth } from '../context/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { getFullImageUrl } from '../utils/api'

const navItems = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { label: 'My Tasks', icon: <ListAltIcon />, path: '/my-tasks' },
  { label: 'Settings', icon: <SettingsIcon />, path: '/settings' },
]

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const drawerContent = (
    <Box display="flex" flexDirection="column" height="100%">
      <Box display="flex" flexDirection="column" alignItems="center" py={3}>
        <Avatar src={getFullImageUrl(user?.photo)} sx={{ width: 64, height: 64, mb: 1 }} />
        <Typography variant="subtitle1" fontWeight={600}>{user?.name || 'User'}</Typography>
        <Typography variant="body2" color="text.secondary">{user?.email || ''}</Typography>
      </Box>
      <Divider />
      <List>
        {navItems.map(item => {
          const isActive = location.pathname + location.search === item.path;
          return (
            <ListItem key={item.label} disablePadding>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  bgcolor: isActive ? 'primary.light' : 'inherit',
                  color: isActive ? 'primary.main' : 'inherit',
                  '&:hover': { bgcolor: 'primary.lighter' },
                  cursor: 'pointer',
                }}
              >
                <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>
      <Divider sx={{ my: 1 }} />
      <Box flexGrow={1} />
      <Box p={2}>
        <Button 
          variant="outlined" 
          color="error" 
          fullWidth 
          startIcon={<LogoutIcon />} 
          onClick={logout}
        >
          Logout
        </Button>
      </Box>
    </Box>
  )

  return isMobile ? (
    <Drawer 
      variant="temporary" 
      open 
      anchor="left" 
      sx={{ 
        zIndex: theme.zIndex.drawer + 1,
        '& .MuiDrawer-paper': { 
          width: 240,
          boxSizing: 'border-box',
          bgcolor: '#f8fafc',
          borderRight: '1px solid #e0e0e0'
        }
      }}
    >
      {drawerContent}
    </Drawer>
  ) : (
    <Drawer 
      variant="permanent" 
      sx={{ 
        width: 240, 
        flexShrink: 0, 
        '& .MuiDrawer-paper': { 
          width: 240, 
          boxSizing: 'border-box', 
          bgcolor: '#f8fafc', 
          borderRight: '1px solid #e0e0e0' 
        } 
      }}
    >
      {drawerContent}
    </Drawer>
  )
}

export default Sidebar 