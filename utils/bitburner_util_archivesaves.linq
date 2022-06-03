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
	foreach (var file in files)
	{
		var info = new FileInfo(file);
		var archiveFolder = $@"{saves}archive\{info.LastWriteTime:yyyy\\MM\\dd\\}";
		if (info.LastWriteTime < DateTime.Today)
		{
			Util.HorizontalRun(true, Util.Metatext($"{file} -> "), new Hyperlinq(archiveFolder)).Dump();
			if (!Directory.Exists(archiveFolder)) Directory.CreateDirectory(archiveFolder);
			File.Move(file, Path.Combine(archiveFolder, Path.GetFileName(file)));	
		}
	}
}

public string SaveString(string key, string path) { Util.SaveString(key, path); return path; }

public const string KEY_PATH_SAVES = "bitburner-path-saves";
public const string MESSAGE_PATH_SAVES = "SAVES: The path provided doesn't exist. Please enter the path to your exported saves location.";
