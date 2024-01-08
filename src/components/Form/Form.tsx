import { FormEvent, useEffect, useState } from 'react';
import Section from '@/components/Form/Section.tsx';
import Input from '@/components/Form/Input.tsx';
import { GitLabSettings, Settings, SettingsChangeEvent } from '@/types.ts';
import Checkbox from '@/components/Form/Checkbox.tsx';
import Footer from '@/components/Form/Footer.tsx';
import Toast from '@/components/Toast/Toast.tsx';
import useFlag from '@/hooks/useFlag.ts';
import { INITIAL_SETTINGS } from '@/constants.ts';
import InputGroup from '@/components/Form/InputGroup.tsx';

const TIP = 'You can take it from board url: https://*.atlassian.net/jira/software/c/projects/[Project Name]/...';

function Form() {
    const [settings, setSettings] = useState<Settings>(INITIAL_SETTINGS);
    const [showToast, displayToast, hideToast] = useFlag();

    useEffect((): void => {
        chrome.storage.sync.get(INITIAL_SETTINGS, (items): void => {
            setSettings(items as Settings);
        });
    }, []);

    const handleSettingsChange = (e: SettingsChangeEvent<string|GitLabSettings[]>): void => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setSettings((s) => ({ ...s, [e.target.name]: value }));
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
        chrome.storage.sync.set(settings, () => {
            displayToast();
        });

        e.preventDefault();
    };

    return (
        <form onSubmit={handleSubmit}>
            <Toast visible={showToast} duration={5000} onHide={hideToast}>Options updated</Toast>
            <Section title="Settings:">
                <Input
                    name="githubAccessToken"
                    label="GitHub Access Token"
                    value={settings.githubAccessToken}
                    onChange={handleSettingsChange}
                />
                <InputGroup<GitLabSettings>
                    name="gitlab"
                    label="GitLab Settings"
                    value={settings.gitlab}
                    emptyValue={INITIAL_SETTINGS.gitlab[0]}
                    onChange={handleSettingsChange}
                >
                    <Input
                        name="projectName"
                        label="Project Name"
                        tip={TIP}
                    />
                    <Input
                        name="hostName"
                        label="GitLab Host Name"
                    />
                    <Input
                        name="accessToken"
                        label="GitLab Access Token"
                    />
                </InputGroup>
                <Checkbox
                    name="hideLabelsOnClosedPRs"
                    label="Exclude labels for closed Pull Requests"
                    checked={settings.hideLabelsOnClosedPRs}
                    onChange={handleSettingsChange}
                />
                <Checkbox
                    name="hideClosedPRs"
                    label="Exclude labels for closed Pull Requests"
                    checked={settings.hideClosedPRs}
                    onChange={handleSettingsChange}
                />
                <Input
                    name="prColumns"
                    label="Comma-separated list of JIRA column titles where labels should be displayed"
                    value={settings.prColumns}
                    onChange={handleSettingsChange}
                />
            </Section>
            <Section title="Feature Flags:">
                <Checkbox
                    name="ffCodeReviewers"
                    label="Display Code Reviewers"
                    checked={settings.ffCodeReviewers}
                    onChange={handleSettingsChange}
                />
                <Checkbox
                    name="ffShortName"
                    label="Display short Repository Name"
                    checked={settings.ffShortName}
                    onChange={handleSettingsChange}
                />
                <Checkbox
                    name="ffCompactReviewers"
                    label="Compact Code Reviewers"
                    checked={settings.ffCompactReviewers}
                    onChange={handleSettingsChange}
                />
            </Section>

            <Footer />
        </form>
    );
}

export default Form;
