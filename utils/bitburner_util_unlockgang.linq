<Query Kind="Program">
  <DisableMyExtensions>true</DisableMyExtensions>
</Query>

#region _UTILITY_
/* === delete/update your strings here (select the following line and hit F5):
Process.Start(new ProcessStartInfo { FileName = $@"{Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData)}\LINQPad\UserData\", Verb = "open", UseShellExecute = true })
*/
#endregion

void Main()
{
	var saves = Util.LoadString(KEY_PATH_SAVES) ?? SaveString(KEY_PATH_SAVES, Util.ReadLine(MESSAGE_PATH_SAVES));
	var files = Directory.GetFiles(saves, "bitburnerSave_*.json");
	var infos = files.Select(f => new FileInfo(f));
	Util.Metatext($"{files.Length} game save export{(files.Length == 1 ? string.Empty : "s")} found").Dump();
	var recent = infos.OrderByDescending(i => i.LastWriteTime).FirstOrDefault();
	var content = Encoding.UTF8.GetString(Convert.FromBase64String(File.ReadAllText(recent.FullName)));
	var found = Regex.Match(content, @"\\""karma\\"":(-?[\d\.]+)", RegexOptions.IgnoreCase).Groups[1].Value;
	Util.Metatext($"replacing {found} karma with -53900").Dump();
	content = Regex.Replace(content, @"\\""karma\\"":-?[\d\.]+", @"\""karma\"":-54900");
	var newFile = Path.Combine(Path.GetDirectoryName(recent.FullName), $"{Path.GetFileNameWithoutExtension(recent.FullName)}_GU");
	File.WriteAllText(newFile, Convert.ToBase64String(Encoding.UTF8.GetBytes(content)));
	File.SetCreationTime(newFile, recent.CreationTime);
	File.SetLastAccessTime(newFile, recent.LastAccessTime);
	File.SetLastWriteTime(newFile, recent.LastWriteTime);
}

public string SaveString(string key, string path) { Util.SaveString(key, path); return path; }

public const string KEY_PATH_SAVES = "bitburner-path-saves";
public const string MESSAGE_PATH_SAVES = "SAVES: The path provided doesn't exist. Please enter the path to your exported saves location.";
