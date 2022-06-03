<Query Kind="Program">
  <NuGetReference>System.IO.Compression.ZipFile</NuGetReference>
  <Namespace>System.IO.Compression</Namespace>
  <DisableMyExtensions>true</DisableMyExtensions>
</Query>

#region _UTILITY_
/* === delete/update your strings here (select the following line and hit F5):
Process.Start(new ProcessStartInfo { FileName = $@"{Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData)}\LINQPad\UserData\", Verb = "open", UseShellExecute = true })
*/
#endregion

void Main()
{
	var zipFile = Util.LoadString(KEY_PATH_ZIP) ?? SaveString(KEY_PATH_ZIP, Util.ReadLine(MESSAGE_PATH_ZIP));
	var repo = Util.LoadString(KEY_PATH_REPO) ?? SaveString(KEY_PATH_REPO, Util.ReadLine(MESSAGE_PATH_REPO));
	var lp = Util.LoadString(KEY_PATH_LINQPAD) ?? SaveString(KEY_PATH_LINQPAD, Util.ReadLine(MESSAGE_PATH_LINQPAD));
	#region _SCRIPTS_
	var vcs = $@"{repo}scripts\";
	if (!Directory.Exists(vcs)) Directory.CreateDirectory(vcs);
	var files = Directory.GetFiles(vcs, "*.*", SearchOption.AllDirectories);
	foreach (var file in files) File.Delete(file);	
	ZipFile.ExtractToDirectory(zipFile, vcs);
	files = Directory.GetFiles(vcs, "*.*", SearchOption.AllDirectories);
	var scriptCount = files.Count(s => Regex.IsMatch(s, @"\.(?:js|script)$"));
	Util.Metatext($"{scriptCount} script and {files.Length - scriptCount} non-script files found").Dump();
	new Hyperlinq(vcs).Dump();
	#endregion
	#region _UTILS_
	var vcu = $@"{repo}utils\";
	if (!Directory.Exists(vcu)) Directory.CreateDirectory(vcu);
	files = Directory.GetFiles(vcu, "*.linq", SearchOption.AllDirectories);
	foreach (var file in files) File.Delete(file);	
	files = Directory.GetFiles(lp, "*.linq", SearchOption.AllDirectories);
	foreach (var file in files) File.Copy(file, file.ToLower().Replace(lp.ToLower(), vcu), true);
	Util.Metatext($"{files.Length} LINQPad queries found").Dump();
	new Hyperlinq(vcu).Dump();
	#endregion
}

public string SaveString(string key, string path) { Util.SaveString(key, path); return path; }

public const string KEY_PATH_ZIP = "bitburner-path-zip";
public const string KEY_PATH_REPO = "bitburner-path-repo";
public const string KEY_PATH_LINQPAD = "bitburner-path-linqpad";
public const string MESSAGE_PATH_ZIP = "ZIP: The path provided doesn't exist. Please enter the path to the scripts .zip file location.";
public const string MESSAGE_PATH_REPO = "REPO: The path provided doesn't exist. Please enter the path to the scripts repository location (with trailing \"\\\").";
public const string MESSAGE_PATH_LINQPAD = "LINQPAD: The path provided doesn't exist. Please enter the path to your LINQPad queries' location (with trailing \"\\\").";
