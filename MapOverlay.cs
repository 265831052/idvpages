using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Windows.Forms;

namespace IdvMapOverlay
{
    internal static class Program
    {
        [STAThread]
        private static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new OverlayForm());
        }
    }

    internal sealed class OverlayForm : Form
    {
        private readonly List<string> _images = new List<string>();
        private readonly PictureBox _picture = new PictureBox();
        private readonly TrackBar _opacity = new TrackBar();
        private readonly Label _counter = new Label();
        private int _index;
        private bool _dragging;
        private Point _dragOffset;

        public OverlayForm()
        {
            LoadImages();
            BuildUi();
        }

        private void LoadImages()
        {
            string root = AppDomain.CurrentDomain.BaseDirectory;
            string folder = Path.Combine(root, "assets", "maps", "real");
            if (!Directory.Exists(folder))
            {
                MessageBox.Show("Map images were not found. Please keep MapOverlay.exe inside the project folder.");
                Environment.Exit(1);
            }

            var files = Directory.GetFiles(folder)
                .Where(file =>
                    file.EndsWith(".jpg", StringComparison.OrdinalIgnoreCase) ||
                    file.EndsWith(".jpeg", StringComparison.OrdinalIgnoreCase) ||
                    file.EndsWith(".png", StringComparison.OrdinalIgnoreCase))
                .OrderBy(file => file, StringComparer.OrdinalIgnoreCase)
                .GroupBy(Path.GetFileNameWithoutExtension)
                .Select(group => group.OrderByDescending(file => file.EndsWith(".png", StringComparison.OrdinalIgnoreCase)).First())
                .OrderBy(file => file, StringComparer.OrdinalIgnoreCase);

            _images.AddRange(files);
            if (_images.Count == 0)
            {
                MessageBox.Show("No map images found in assets\\maps\\real.");
                Environment.Exit(1);
            }
        }

        private void BuildUi()
        {
            Text = "IDV Map Overlay";
            ClientSize = new Size(380, 680);
            StartPosition = FormStartPosition.Manual;
            Location = new Point(90, 90);
            FormBorderStyle = FormBorderStyle.None;
            TopMost = true;
            ShowInTaskbar = false;
            BackColor = Color.FromArgb(22, 26, 31);
            Opacity = 0.92;
            KeyPreview = true;

            var header = new Panel
            {
                Dock = DockStyle.Top,
                Height = 46,
                BackColor = Color.FromArgb(29, 35, 42)
            };

            var title = new Label
            {
                Text = "IDV Map Overlay",
                ForeColor = Color.White,
                Font = new Font("Microsoft YaHei UI", 10, FontStyle.Bold),
                AutoSize = true,
                Location = new Point(12, 14)
            };

            Button prev = MakeButton("<", 260);
            Button next = MakeButton(">", 298);
            Button close = MakeButton("X", 336);
            prev.Click += delegate { Step(-1); };
            next.Click += delegate { Step(1); };
            close.Click += delegate { Close(); };

            header.Controls.Add(title);
            header.Controls.Add(prev);
            header.Controls.Add(next);
            header.Controls.Add(close);

            _picture.Dock = DockStyle.Fill;
            _picture.SizeMode = PictureBoxSizeMode.Zoom;
            _picture.BackColor = Color.FromArgb(11, 13, 15);

            var bottom = new Panel
            {
                Dock = DockStyle.Bottom,
                Height = 56,
                BackColor = Color.FromArgb(22, 26, 31)
            };

            _counter.ForeColor = Color.FromArgb(170, 179, 189);
            _counter.Font = new Font("Microsoft YaHei UI", 9);
            _counter.AutoSize = true;
            _counter.Location = new Point(12, 20);
            _counter.Text = "Map 1 / " + _images.Count;

            _opacity.Minimum = 35;
            _opacity.Maximum = 100;
            _opacity.Value = 90;
            _opacity.TickStyle = TickStyle.None;
            _opacity.Width = 230;
            _opacity.Height = 40;
            _opacity.Location = new Point(130, 6);
            _opacity.BackColor = Color.FromArgb(22, 26, 31);
            _opacity.ForeColor = Color.FromArgb(226, 163, 76);
            _opacity.ValueChanged += delegate { Opacity = _opacity.Value / 100.0; };

            bottom.Controls.Add(_counter);
            bottom.Controls.Add(_opacity);

            Controls.Add(_picture);
            Controls.Add(header);
            Controls.Add(bottom);

            MouseDown += DragDown;
            MouseMove += DragMove;
            MouseUp += DragUp;
            header.MouseDown += DragDown;
            header.MouseMove += DragMove;
            header.MouseUp += DragUp;
            title.MouseDown += DragDown;
            title.MouseMove += DragMove;
            title.MouseUp += DragUp;

            KeyDown += delegate(object sender, KeyEventArgs e)
            {
                if (e.KeyCode == Keys.Left)
                {
                    Step(-1);
                }
                else if (e.KeyCode == Keys.Right)
                {
                    Step(1);
                }
                else if (e.KeyCode == Keys.Escape)
                {
                    Close();
                }
            };

            Shown += delegate { Render(); };
        }

        private Button MakeButton(string text, int left)
        {
            return new Button
            {
                Text = text,
                Width = 34,
                Height = 30,
                Left = left,
                Top = 8,
                FlatStyle = FlatStyle.Flat,
                BackColor = Color.FromArgb(29, 35, 42),
                ForeColor = Color.White,
                Font = new Font("Microsoft YaHei UI", 12, FontStyle.Bold),
                Cursor = Cursors.Hand
            };
        }

        private void Render()
        {
            if (_images.Count == 0)
            {
                return;
            }

            Image temp = Image.FromFile(_images[_index]);
            Image copy = new Bitmap(temp);
            temp.Dispose();
            if (_picture.Image != null)
            {
                _picture.Image.Dispose();
            }
            _picture.Image = copy;
            _counter.Text = "Map " + (_index + 1) + " / " + _images.Count;
            Text = "IDV Map Overlay - Map " + (_index + 1);
        }

        private void Step(int direction)
        {
            _index = (_index + direction + _images.Count) % _images.Count;
            Render();
        }

        private void DragDown(object sender, MouseEventArgs e)
        {
            if (e.Button == MouseButtons.Left)
            {
                _dragging = true;
                _dragOffset = e.Location;
            }
        }

        private void DragMove(object sender, MouseEventArgs e)
        {
            if (!_dragging)
            {
                return;
            }
            Location = new Point(Left + e.X - _dragOffset.X, Top + e.Y - _dragOffset.Y);
        }

        private void DragUp(object sender, MouseEventArgs e)
        {
            _dragging = false;
        }
    }
}
