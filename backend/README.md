# Colortelier Backend API

This is the backend API for the Colortelier application, built with Express.js and Supabase.

## Features

- **Authentication**: User registration, login, and profile management
- **Color Codes**: Create, read, update, delete color codes with RGB/HSL values
- **Themes**: Theme management with thumbnail images (WebP)
- **Filters**: Before/after filter management with XMP files
- **Likes**: Like/unlike system for color codes and filters
- **Cart**: Shopping cart functionality for color codes and filters
- **File Upload**: Supabase Storage integration for images and files

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and keys
3. Create storage buckets named `themes` and `filters`
4. Run the SQL schema from `src/config/schema.sql` in your Supabase SQL editor

### 3. Environment Variables

```bash
cp env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Supabase Configuration
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# JWT Configuration
JWT_SECRET=your-jwt-secret-key-here

# File Upload Configuration
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=webp,xmp
```

### 4. Start Development Server

```bash
npm run dev
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Color Codes

- `GET /api/colors` - Get all color codes (with pagination, search, sorting)
- `GET /api/colors/:id` - Get color code by ID
- `POST /api/colors` - Create color code (authenticated)
- `PUT /api/colors/:id` - Update color code (authenticated, owner only)
- `DELETE /api/colors/:id` - Delete color code (authenticated, owner only)

**Color Code Fields:**

- `color_code` - Unique color identifier (e.g., "L-KR-SEL-HNGD-CL-GD")
- `hex_code` - Hex color value (e.g., "#FF5733")
- `rgb_r`, `rgb_g`, `rgb_b` - RGB values (0-255)
- `cmyk_c`, `cmyk_m`, `cmyk_y`, `cmyk_k` - CMYK values (0-100)
- `hsl_h`, `hsl_s`, `hsl_l` - HSL values (optional)

### Themes

- `GET /api/themes` - Get all themes (with pagination, search, sorting)
- `GET /api/themes/:id` - Get theme by ID
- `POST /api/themes` - Create theme with thumbnail (authenticated)
- `PUT /api/themes/:id` - Update theme (authenticated, owner only)
- `DELETE /api/themes/:id` - Delete theme (authenticated, owner only)

### Filters

- `GET /api/filters` - Get all filters (with pagination, search, sorting)
- `GET /api/filters/:id` - Get filter by ID
- `POST /api/filters` - Create filter with images and XMP file (authenticated)
- `PUT /api/filters/:id` - Update filter (authenticated, owner only)
- `DELETE /api/filters/:id` - Delete filter (authenticated, owner only)

### Likes

- `POST /api/likes/color-codes/:colorCodeId` - Toggle like for color code
- `POST /api/likes/filters/:filterId` - Toggle like for filter
- `GET /api/likes/my-likes?type=color_codes|filters` - Get user's likes
- `GET /api/likes/status?type=color_code|filter&id=:id` - Check like status

### Cart

- `POST /api/cart/add` - Add item to cart (body: `{type: 'color_code'|'filter', id: 'uuid'}`)
- `GET /api/cart` - Get cart items (with pagination, optional type filter)
- `DELETE /api/cart/:id` - Remove item from cart
- `DELETE /api/cart` - Clear entire cart
- `GET /api/cart/count` - Get cart item count

## Database Schema

The application uses the following main tables:

- `users` - User accounts
- `color_codes` - Color code entries
- `themes` - Theme entries with thumbnails
- `filters` - Filter entries with before/after images and XMP files
- `likes` - User likes for color codes and filters
- `cart_items` - Shopping cart items

## File Storage

- **Themes**: WebP thumbnail images stored in `themes` bucket
- **Filters**: WebP before/after images and XMP files stored in `filters` bucket
- Files are automatically cleaned up when items are deleted

## Authentication

- JWT-based authentication
- Password hashing with bcrypt
- Tokens expire after 7 days

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "message": "Additional details (development only)"
}
```

## Development

```bash
# Start with auto-reload
npm run dev

# Start production server
npm start
```

## Deployment

This backend is configured to deploy on Render. Make sure to set the following environment variables in Render:

- `NODE_ENV=production`
- `FRONTEND_URL=https://your-frontend-url.netlify.app`
- `PORT=3001` (automatically set by Render)
- All Supabase configuration variables
- `JWT_SECRET` for authentication
